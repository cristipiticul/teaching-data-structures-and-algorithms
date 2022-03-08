/*
 Exemplu luat de pe https://curl.haxx.se/libcurl/c/http-post.html
 Instructiuni MacOS:
 - Mergi la setarile proiectului (click pe cel mai de sus folder din stanga)
 - Sus este un tab de "Build Settings"
 - Tot sus este "Basic  Advanced  All" -> selecteaza All
 - Cauta categoria "Linking" -> "Other Linking Flags"
 - Daca duci mousul deasupra la "Debug", apare un "+" in dreapta -> click pe +
 - Scrie "-lcurl" (-LCURL cu litere mici, fara ghilimele) si apasa Enter
 - La fel si pentru "Release"
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>

// Adresa server-ului
const char* URL = "http://94.52.248.163/login";

/* Functia verifica username-ul si parola si afiseaza un mesaj.
 Daca sunt incorecte, va afisa: Username: roberto, Parola: abc - Incorect :(
 Daca sunt   corecte, va afisa: Username: roberto, Parola: cge - Corect!!!
 Daca sunt   corecte, va opri programul!!
 */
void incearca_login(const char* username, const char* password);

void init();
void cleanup();

int main(void)
{
    init();
    
    // Ar trebui sa afiseze:
    // Username: roberto, Parola: abc - Incorect :(
    incearca_login("roberto", "abc");
    
    // Acelasi lucru ca linia de mai sus, doar cu variabila
    // Ar trebui sa afiseze:
    // Username: roberto, Parola: abc - Incorect :(
    char parola[10];
    parola[0] = 'a';
    parola[1] = 'b';
    parola[2] = 'c';
    parola[3] = '\0'; // Nu uitam terminatorul nul!!
    incearca_login("roberto", parola);
    
    // Ar trebui sa afiseze:
    // Username: roberto, Parola: cge - Corect!!!
    incearca_login("roberto", "cge");
    
    cleanup();
    return 0;
}



#define MAX_RESPONSE_LENGTH 4000

size_t write_callback(char *response_data, size_t size, size_t nmemb, void *output)
{
    if (size * nmemb + 1 > MAX_RESPONSE_LENGTH) {
        printf("Eroare! Raspunsul depaseste limita de caractere!");
        return 0;
    }
    memcpy(output, response_data, size * nmemb + 1);
    ((char*)output)[size * nmemb] = 0;
    return size * nmemb;
}

void init() {
    /* In windows, this will init the winsock stuff */
    curl_global_init(CURL_GLOBAL_ALL);
}

void incearca_login(const char* username, const char* password) {
    CURL *curl;
    CURLcode res;
    
    
    /* get a curl handle */
    curl = curl_easy_init();
    if(curl) {
        char response[MAX_RESPONSE_LENGTH];
        char postFields[200];
        sprintf(postFields, "username=%s&password=%s", username, password);
        curl_easy_setopt(curl, CURLOPT_URL, URL);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postFields);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, response);
        
        res = curl_easy_perform(curl);
        if(res == CURLE_OK) {
            if (strstr(response, "Nume utilizator sau parola gresita!") == NULL) {
                printf("Username: %s, Parola: %s - Corect!!!\n", username, password);
                exit(0);
            } else {
                printf("Username: %s, Parola: %s - Incorect :(\n", username, password);
            }
        } else {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }
        
        curl_easy_cleanup(curl);
    }
}

void cleanup() {
    curl_global_cleanup();
}
