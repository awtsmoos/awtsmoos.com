/* B"H */

export const STDLIB = `
// --- B"H Standard Library ---
import "KERNEL32.dll" GetStdHandle WriteFile ReadFile ExitProcess Sleep CreateFileA CloseHandle FindFirstFileA FindNextFileA FindClose;
import "USER32.dll" MessageBoxA;

// -- Types --
// Note: Structs are simulated with int arrays or offsets in this version.

// -- STDIO --
int STDIN = -10;
int STDOUT = -11;

void print(char* str) {
    int len = 0;
    char* ptr = str;
    while (*ptr != 0) { len++; ptr++; }
    int written = 0;
    int h = GetStdHandle(STDOUT);
    WriteFile(h, str, len, &written, 0);
}

// Minimal printf implementation
// Supports %s, %d, %c, %x (hex)
// Note: Limited to 4 arguments because this compiler doesn't support varargs (...) yet.
// Users must pass 0 for unused args if calling directly, but wrappers can help.
void printf(char* fmt, int a1, int a2, int a3, int a4) {
    char* p = fmt;
    int argIdx = 0;
    
    // We need to pick which arg to use. Arrays in C are easier.
    int args[4];
    args[0] = a1; args[1] = a2; args[2] = a3; args[3] = a4;
    
    while (*p != 0) {
        if (*p == 37) { // '%'
            p++;
            if (*p == 0) break;
            
            int val = args[argIdx];
            argIdx++;
            
            if (*p == 115) { // 's'
                print(val);
            } else if (*p == 99) { // 'c'
                char cbuf[2]; cbuf[0] = val; cbuf[1] = 0;
                print(cbuf);
            } else if (*p == 100) { // 'd'
                if (val == 0) print("0");
                else {
                    if (val < 0) { print("-"); val = -val; }
                    char buf[32]; int i = 30; buf[31] = 0;
                    while (val > 0) {
                        int d = val / 10;
                        int r = val - (d * 10);
                        buf[i] = r + 48; i--;
                        val = d;
                    }
                    print(buf + i + 1);
                }
            } else if (*p == 120) { // 'x'
                print("0x");
                if (val == 0) print("0");
                else {
                    char buf[32]; int i = 30; buf[31] = 0;
                    while (val != 0) {
                        int d = val / 16;
                        int r = val - (d * 16); // Remainder
                        if (r < 10) buf[i] = r + 48;
                        else buf[i] = r + 55; // A-F
                        i--;
                        val = d;
                    }
                    print(buf + i + 1);
                }
            }
        } else {
            char cbuf[2];
            cbuf[0] = *p;
            cbuf[1] = 0;
            print(cbuf);
        }
        p++;
    }
}

// File I/O
int fopen(char* filename, char* mode) {
    // Mode 'r' = Read, 'w' = Write/Create
    int access = 0x80000000; // Generic Read
    int create = 3; // Open Existing
    
    if (*mode == 119) { // 'w'
        access = 0x40000000; // Generic Write
        create = 2; // Create Always
    }
    
    return CreateFileA(filename, access, 0, 0, create, 128, 0);
}

void fclose(int handle) {
    CloseHandle(handle);
}

int fgetc(int handle) {
    char buf[1];
    int read = 0;
    ReadFile(handle, buf, 1, &read, 0);
    if (read == 0) return -1; // EOF
    return buf[0];
}

void fputc(int handle, char c) {
    char buf[1]; buf[0] = c;
    int written = 0;
    WriteFile(handle, buf, 1, &written, 0);
}

// -- DIRENT Simulation --
// Since we can't define 'struct DIR' in user code yet with custom fields,
// we use a simplified handle approach.
// Users interact with an 'int' handle which maps to the Find Handle.

int opendir(char* path) {
    // Construct search string: path + "/*"
    // For simplicity, assume path is current dir "." or just pass "*.*"
    char search[260];
    char* s = search;
    char* p = path;
    while (*p != 0) { *s = *p; s++; p++; }
    // Append \*.*
    *s = 92; s++; // \
    *s = 42; s++; // *
    *s = 46; s++; // .
    *s = 42; s++; // *
    *s = 0;
    
    // We need a buffer for WIN32_FIND_DATA (320 bytes)
    // We can't malloc, so we use a static buffer? No, strict reentrancy issues.
    // For this single-threaded toy compiler, static is fine, OR caller allocates.
    // Let's assume the handle returned is just the FIND handle.
    // The DATA must be managed by readdir.
    
    // Allocate buffer on heap? No heap.
    // We will just return the Handle. The data buffer is passed to readdir.
    return 0; // Not fully implemented without structs
}

// Simplified: list_files example handles the structs manually.
`;