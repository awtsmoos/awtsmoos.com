/* B"H */

const IMPORTS_COMMON = `
import "KERNEL32.dll" ExitProcess Sleep GetStdHandle WriteFile ReadFile CreateFileA CloseHandle FindFirstFileA FindNextFileA FindClose GetCommandLineA GetEnvironmentVariableA;
import "msvcrt.dll" printf sprintf sscanf fopen fclose fread fwrite fseek ftell feof rewind remove rename tmpfile tmpnam puts gets getchar putchar malloc free calloc realloc rand srand system abs labs atoi atol atof exit abort qsort bsearch strcpy strncpy strcat strncat strcmp strncmp strlen strchr strrchr strstr memset memcpy memmove memcmp tolower toupper isalpha isdigit isalnum isspace isprint ispunct iscntrl isxdigit clock time difftime mktime strftime fflush;
`;

const STDIO_H = `${IMPORTS_COMMON}
int STDIN = 0;
int STDOUT = 1;
int STDERR = 2;
`;

const STDLIB_H = `${IMPORTS_COMMON}
`;

const STRING_H = `${IMPORTS_COMMON}
`;

const UNISTD_H = `${IMPORTS_COMMON}
void sleep(int ms) { Sleep(ms); }
void usleep(int us) { Sleep(us / 1000); }
`;

// WIN32_FIND_DATAA (320 bytes total)
// We use 'int' for the 4-byte fields to ensure 4-byte alignment/size in our struct.
const DIRENT_H = `${IMPORTS_COMMON}
struct dirent {
    int dwFileAttributes;
    int ftCreationTimeL;   int ftCreationTimeH;
    int ftLastAccessTimeL; int ftLastAccessTimeH;
    int ftLastWriteTimeL;  int ftLastWriteTimeH;
    int nFileSizeHigh;
    int nFileSizeLow;
    int dwReserved0;
    int dwReserved1;
    char d_name[260];
    char alt_name[14];
    char _pad[2]; // align to 320
};

struct DIR {
    char* hFind;        
    struct dirent data; 
    int first;          
};

struct DIR _gDir;

struct DIR* opendir(char* path) {
    _gDir.first = 0;
    _gDir.hFind = 0;

    char search[260];
    char* s = search; 
    char* p = path;
    
    while (*p != 0) { *s = *p; s++; p++; }
    
    // Append "\\*"
    *s = 92; s++; // '\\'
    *s = 42; s++; // '*'
    *s = 0;
    
    int h = FindFirstFileA(search, &_gDir.data);
    
    if (h == -1) return 0; // INVALID_HANDLE_VALUE
    
    _gDir.hFind = h;
    _gDir.first = 1;
    return &_gDir;
}

struct dirent* readdir(struct DIR* d) {
    if (d == 0) return 0;
    if (d->first) {
        d->first = 0;
        return &d->data;
    }
    if (FindNextFileA(d->hFind, &d->data) != 0) {
        return &d->data;
    }
    return 0;
}

void closedir(struct DIR* d) {
    if (d != 0) {
        if (d->hFind != -1) FindClose(d->hFind);
    }
}
`;

const TIME_H = `${IMPORTS_COMMON}
`;

export const STD_LIBS = {
    'stdio.h': STDIO_H,
    'stdlib.h': STDLIB_H,
    'string.h': STRING_H,
    'math.h': IMPORTS_COMMON,
    'time.h': TIME_H,
    'dirent.h': DIRENT_H,
    'unistd.h': UNISTD_H
};