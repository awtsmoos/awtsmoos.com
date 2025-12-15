/* B"H */

const STD_KERNEL32 = `import "KERNEL32.dll" GetStdHandle WriteFile ReadFile ExitProcess Sleep CreateFileA CloseHandle FindFirstFileA FindNextFileA FindClose;`;

// Use positive 32-bit integers for Handles to avoid sign-extension issues in x64 registers
// STD_INPUT_HANDLE = -10 => 0xFFFFFFF6
// STD_OUTPUT_HANDLE = -11 => 0xFFFFFFF5
const STDIO_H = `${STD_KERNEL32}
int STDIN = 0xFFFFFFF6;
int STDOUT = 0xFFFFFFF5;

void exit(int code) { ExitProcess(code); }

void print(char* str) {
    int len = 0;
    char* ptr = str;
    while (*ptr != 0) { len++; ptr++; }
    int written = 0;
    int h = GetStdHandle(STDOUT);
    WriteFile(h, str, len, &written, 0);
}

void print_char(char c) {
    char b[2];
    b[0] = c;
    b[1] = 0;
    print(b);
}

void print_u(int n) {
    if (n == 0) {
        print("0");
        return;
    }
    char buf[32];
    int i = 30;
    buf[31] = 0;
    
    while (n > 0) {
        int d = n / 10;
        int r = n - d * 10;
        buf[i] = r + 48;
        i--;
        n = d;
    }
    char* s = buf + i + 1;
    print(s);
}

void print_hex(int n) {
    print("0x");
    if (n == 0) {
        print("0");
        return;
    }
    char buf[32];
    int i = 30;
    buf[31] = 0;
    
    while (n != 0) {
        int d = n / 16;
        int r = n - d * 16;
        if (r < 10) buf[i] = r + 48;
        else buf[i] = r + 55;
        i--;
        n = d;
    }
    char* s = buf + i + 1;
    print(s);
}

void printf(char* fmt, int a1, int a2, int a3, int a4) {
    char* p = fmt;
    int args[4];
    args[0] = a1; args[1] = a2; args[2] = a3; args[3] = a4;
    int argIdx = 0;
    
    while (*p != 0) {
        if (*p == 37) {
            p++;
            int val = args[argIdx]; 
            argIdx++;
            
            if (*p == 115) {
                print(val); 
            }
            else if (*p == 100) {
                if (val < 0) {
                    print("-");
                    val = 0 - val;
                }
                print_u(val);
            }
            else if (*p == 120) {
                print_hex(val);
            }
            else if (*p == 99) {
                print_char(val);
            }
        } else {
            print_char(*p);
        }
        p++;
    }
}

int fopen(char* f, char* m) {
    int acc = 0x80000000; int cr = 3;
    if (*m == 119) { acc = 0x40000000; cr = 2; }
    return CreateFileA(f, acc, 0, 0, cr, 128, 0);
}
void fclose(int h) { CloseHandle(h); }
`;

const DIRENT_H = `${STD_KERNEL32}
struct dirent {
    int dwFileAttributes;
    int ftCreationTimeL; int ftCreationTimeH;
    int ftLastAccessTimeL; int ftLastAccessTimeH;
    int ftLastWriteTimeL; int ftLastWriteTimeH;
    int nFileSizeHigh;
    int nFileSizeLow;
    int dwReserved0;
    int dwReserved1;
    char d_name[260];
    char cAlternateFileName[14];
};

struct DIR {
    int hFind;
    struct dirent data;
    int first;
};

struct DIR _gDir;

struct DIR* opendir(char* path) {
    char search[260];
    char* s = search; char* p = path;
    while (*p != 0) { *s = *p; s++; p++; }
    *s = 92; s++; *s = 42; s++; *s = 46; s++; *s = 42; s++; *s = 0;
    
    int h = FindFirstFileA(search, &_gDir.data);
    if (h == -1) return 0;
    
    _gDir.hFind = h;
    _gDir.first = 1;
    return &_gDir;
}

struct dirent* readdir(struct DIR* d) {
    if (d->first) {
        d->first = 0;
        return &d->data;
    }
    if (FindNextFileA(d->hFind, &d->data)) return &d->data;
    return 0;
}

void closedir(struct DIR* d) {
    FindClose(d->hFind);
}
`;

const UNISTD_H = `${STD_KERNEL32}
void sleep(int ms) { Sleep(ms); }
`;

export const STD_LIBS = {
    'stdio.h': STDIO_H,
    'dirent.h': DIRENT_H,
    'unistd.h': UNISTD_H
};