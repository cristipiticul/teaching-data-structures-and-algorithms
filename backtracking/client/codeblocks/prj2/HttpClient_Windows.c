#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wininet.h>

/// Pentru a merge:
/// Click dreapta pe proiect -> Build Options -> Linker Settings -> Link Libraries apasa Add
/// Scrie "wininet" (fara ghilimele) si Ok!
/// Apasa in stanga pe Release si fa acelasi lucru

const char* ADDRESS = "94.52.248.163";
INTERNET_PORT PORT = INTERNET_DEFAULT_HTTP_PORT;

/** Functia verifica username-ul si parola si afiseaza un mesaj.
 Daca sunt incorecte, va afisa: Username: roberto, Parola: abc - Incorect :(
 Daca sunt   corecte, va afisa: Username: roberto, Parola: cge - Corect!!!
 Daca sunt   corecte, va opri programul!!
 */
void incearca_login(char* username, char* password);

void init();
void cleanup();

int main(void)
{
    init();

    /// Ar trebui sa afiseze:
    /// Username: roberto, Parola: abc - Incorect :(
    incearca_login("roberto", "abc");

    /// Acelasi lucru ca linia de mai sus, doar cu variabila
    /// Ar trebui sa afiseze:
    /// Username: roberto, Parola: abc - Incorect :(
    char parola[10];
    parola[0] = 'a';
    parola[1] = 'b';
    parola[2] = 'c';
    parola[3] = '\0'; // Nu uitam terminatorul nul!!
    incearca_login("roberto", parola);

    /// Ar trebui sa afiseze:
    /// Username: roberto, Parola: cge - Corect!!!
    incearca_login("roberto", "cge");

    cleanup();
    return 0;
}

int request(char* username, char* parola, char* response, DWORD response_sz);

void incearca_login(char* username, char* parola)
{
    char response[4096];
    DWORD responseSize = 4096;
    request(username, parola, response, responseSize);
    if (strstr(response, "Nume utilizator sau parola gresita!") == NULL)
    {
        printf("Username: %s, Parola: %s - Corect!!!\n", username, parola);
        exit(0);
    }
    else
    {
        printf("Username: %s, Parola: %s - Incorect :(\n", username, parola);
    }
}

/// Implementare bazata pe biblioteca wininet:
/// https://docs.microsoft.com/en-us/windows/desktop/wininet/http-sessions

typedef struct _InternetParams {
    HINTERNET hInternet;
    HINTERNET hConnect;
} InternetParams;
InternetParams internetParams;

void init()
{
    internetParams.hInternet = InternetOpen("http-c-client", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (internetParams.hInternet == NULL)
    {
        printf("EROARE la InternetOpen()! Poate sunt probleme de proxy? Cod eroare: %lu.\n", GetLastError());
        exit(-1);
    }
    internetParams.hConnect = InternetConnect(internetParams.hInternet, ADDRESS, PORT, NULL, NULL, INTERNET_SERVICE_HTTP, 0, 0);
    if (internetParams.hConnect == NULL)
    {
        printf("EROARE la InternetConnect()! Poate adresa/portul sunt gresite. Cod eroare: %lu.\n", GetLastError());
        exit(-1);
    }
}

int request(char* username, char* parola, char* response, DWORD response_sz)
{
    HINTERNET hRequest = HttpOpenRequest(internetParams.hConnect, "POST", "/login", NULL, NULL, NULL, 0, 0);
    if (hRequest == NULL)
    {
        printf("EROARE la HttpOpenRequest()! Poate obiectul accesat nu e bun. Cod eroare: %lu.\n", GetLastError());
        return 0;
    }
    char postData[1000];
    sprintf(postData, "username=%s&password=%s", username, parola);
    DWORD postDataSize = strlen(postData);
    if (!HttpSendRequest(hRequest, NULL, 0, postData, postDataSize))
    {
        printf("EROARE la HttpSendRequest()! Poate postData nu e bun. Cod eroare: %lu.\n", GetLastError());
        return 0;
    }
    DWORD numberOfBytesRead;
    if (!InternetReadFile(hRequest, response, response_sz, &numberOfBytesRead))
    {
        printf("EROARE la InternetReadFile()! Cod eroare: %lu.\n", GetLastError());
        return 0;
    }

    InternetCloseHandle(hRequest);
    return 1;
}

void cleanup(InternetParams *params)
{
    InternetCloseHandle(internetParams.hConnect);
    InternetCloseHandle(internetParams.hInternet);
}
