/* B"H */

export const STDLIB = `
// --- B"H Standard Library ---
import "KERNEL32.dll" GetStdHandle WriteFile ReadFile ExitProcess Sleep CreateFileA CloseHandle FindFirstFileA FindNextFileA FindClose;
import "USER32.dll" MessageBoxA;

// -- STDIO --
int STDIN = -10;
int STDOUT = -11;

void print(char* str) {
    int len = 0;
    char* ptr = str;
    while (*ptr != 0) { len = len + 1; ptr = ptr + 1; }
    int written = 0;
    int h = GetStdHandle(STDOUT);
    WriteFile(h, str, len, &written, 0);
}

void printf(char* fmt, int a1, int a2, int a3, int a4) {
    char* p = fmt;
    int args[4];
    args[0] = a1; args[1] = a2; args[2] = a3; args[3] = a4;
    int argIdx = 0;
    
    while (*p != 0) {
        if (*p == 37) { // %
            p = p + 1;
            int val = args[argIdx]; 
            argIdx = argIdx + 1;
            
            if (*p == 115) { // s
                print(val); 
            }
            else if (*p == 100) { // d
                 if (val == 0) print("0");
                 else {
                     if (val < 0) { print("-"); val = -val; }
                     char buf[32]; 
                     int i = 30; 
                     buf[31] = 0;
                     
                     while (val > 0) {
                         // Use modulo operator directly
                         int r = val % 10;
                         buf[i] = r + 48; 
                         i = i - 1;
                         val = val / 10;
                     }
                     print(buf + i + 1);
                 }
            }
            else if (*p == 120) { // x
                 print("0x");
                 if (val == 0) print("0");
                 else {
                     char buf[32]; 
                     int i = 30; 
                     buf[31] = 0;
                     while (val != 0) {
                         int r = val % 16;
                         if (r < 10) buf[i] = r + 48;
                         else buf[i] = r + 55;
                         i = i - 1;
                         val = val / 16;
                     }
                     print(buf + i + 1);
                 }
            }
            else if (*p == 99) { // c
                char b[2]; 
                b[0] = val; 
                b[1] = 0; 
                print(b); 
            } 
        } else {
            char b[2]; 
            b[0] = *p; 
            b[1] = 0; 
            print(b);
        }
        p = p + 1;
    }
}

int fopen(char* f, char* m) {
    int acc = 0x80000000; int cr = 3;
    if (*m == 119) { acc = 0x40000000; cr = 2; }
    return CreateFileA(f, acc, 0, 0, cr, 128, 0);
}
void fclose(int h) { CloseHandle(h); }
`;
