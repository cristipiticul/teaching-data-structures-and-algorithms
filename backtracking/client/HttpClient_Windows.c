#include <stdio.h>
#include <wininet.h>
#include <string.h>

/// Pentru a merge:
/// Click dreapta pe proiect -> Build Options -> Linker Settings -> Link Libraries apasa Add
/// Scrie "wininet" (fara ghilimele) si Ok!
/// Apasa in stanga pe Release si fa acelasi lucru

#define ADDRESS "10.150.3.111"

/// https://docs.microsoft.com/en-us/windows/desktop/wininet/http-sessions

typedef struct _InternetParams {
    HINTERNET hInternet;
    HINTERNET hConnect;
} InternetParams;
InternetParams internetParams;

int init(InternetParams *params)
{
    params->hInternet = InternetOpen("http-c-client", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (params->hInternet == NULL)
    {
        printf("EROARE la InternetOpen()! Poate sunt probleme de proxy? Cod eroare: %lu.\n", GetLastError());
        return 0;
    }
    params->hConnect = InternetConnect(params->hInternet, ADDRESS, INTERNET_DEFAULT_HTTP_PORT, NULL, NULL, INTERNET_SERVICE_HTTP, 0, 0);
    if (params->hConnect == NULL)
    {
        printf("EROARE la InternetConnect()! Poate adresa/portul sunt gresite. Cod eroare: %lu.\n", GetLastError());
        return 0;
    }
    return 1;
}

int request(char* username, char* parola, char* response, DWORD response_sz)
{
    HINTERNET hRequest = HttpOpenRequest(internetParams.hConnect, "POST", "/", NULL, NULL, NULL, 0, 0);
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
    InternetCloseHandle(params->hConnect);
    InternetCloseHandle(params->hInternet);
}

int incearca(char* username, char* parola)
{
    char response[4096];
    DWORD responseSize = 4096;
    request(username, parola, response, responseSize);
    if (strstr(response, "ok"))
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

int main()
{
    if (!init(&internetParams))
    {
        return 0;
    }

    printf("%d",incearca("andrisan_andreea_1", "kek"));

    cleanup(&internetParams);

    return 0;
}
