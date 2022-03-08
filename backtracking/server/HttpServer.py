from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import socketserver
import json
import re
import os
import shutil

f = open('passwords.txt', 'r')
users = json.loads(f.read())
f.close()

formHtml = '''<!DOCTYPE html>
<html>
    <head>
        <title>Poze cu Mihai</title>
        <style>
            html {
                height: 100%;
            }
            body {
                display: flex;
                margin: 0px;
                height: 100%;
                width: 100%;
                align-items: center;
                justify-content: center;
                font-family: 'Arial';
            }
            form {
                display: flex;
                flex-direction: column;
                border: 1px solid #000;
                border-radius: 15px;
                padding: 20px;
            }
            input[type=text],input[type=password] {
                width: 100%;
                padding: 6px 12px;
                margin: 3px 0;
                box-sizing: border-box;
                font-size: 14pt;
            }
            input[type=button], input[type=submit], input[type=reset] {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                margin: 4px 2px;
                cursor: pointer;
                font-size: 18pt;
            }
            table {
                border-collapse: collapse;
            }
            table, th, td {
                border: 1px solid black;
            }
        </style>
    </head>
    <body>
        <form method="POST" action="/login">
            <h1>Poze cu Mihai Traistariu</h1>
            <input type="text" placeholder="Username" name="username">
            <br>
            <input type="password" placeholder="Password" name="password">
            <br>
            <input type="submit" value="Login">
            <br>
            <p><b>Useri existenti:</b></p>
            <table>
                <tr><th>Username</th><th>Detalii parola</th></tr>''' + ''.join(map(lambda user : '<tr><td>'+user['username']+'</td><td>' + user['passwordDescription']+'</td></tr>', users)) + '''
            </table>
        </form>
    </body>
</html>'''

class HTTPRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        if (self.path.endswith('.jpg')):
            self.do_GET_static_image()
            return
        self._set_headers()
        self.wfile.write(formHtml.encode('utf-8'))

    def do_GET_static_image(self):
        filename = self.path[self.path.rfind('/')+1:]
        try:
            img_file = open(filename, 'rb')
            fs = os.fstat(img_file.fileno())

            self.send_response(200)
            self.send_header('Content-type', 'image/jpeg')
            self.send_header("Content-Length", str(fs[6]))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            
            shutil.copyfileobj(img_file, self.wfile)
            img_file.close()
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def do_HEAD(self):
        self._set_headers()
        
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        self._set_headers()
        reqData = self.rfile.read(content_length).decode('utf-8')
        username, password = re.search('username=(.*)&password=(.*)', reqData).group(1, 2)
        foundUsers = list(filter(lambda user : user['username'] == username and user['password'] == password, users))
        
        responseTemplate = '''<!DOCTYPE html>
            <html style="width:100%;height:100%">
                <body style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center">
                    {}<br>
                    <a href="javascript:history.back()">Mergi inapoi</a>
                </body>
            </html>'''
        if len(foundUsers) == 1:
            imgName = foundUsers[0]['image']
            response = responseTemplate.format('<img src="{}" style="width: 600px;">'.format(imgName))
        else:
            response = responseTemplate.format('<h1>Nume utilizator sau parola gresita!</h1>')
        self.wfile.write(response.encode('utf-8'))

def run(server_class=ThreadingHTTPServer, handler_class=HTTPRequestHandler):
    server_address = ('192.168.0.202', 8080)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()
