/* B"H */
export const source = `// B"H
#include <stdio.h>
import "USER32.dll" RegisterClassA CreateWindowExA ShowWindow GetMessageA TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage MessageBoxA GetWindowTextA LoadCursorA;
import "KERNEL32.dll" GetModuleHandleA ExitProcess GetLastError;

char* ClassName = "InputWin";
char* Title = "B\\"H - Input Box";

int hEdit = 0;

int WndProc(int hWnd, int msg, int wp, int lp) {
    if (msg == 2) { // WM_DESTROY
        PostQuitMessage(0);
        return 0;
    }
    if (msg == 273) { // WM_COMMAND
        if (wp == 102) { // Button ID
            char buf[256];
            GetWindowTextA(hEdit, buf, 256);
            MessageBoxA(hWnd, buf, "You Typed:", 0);
        }
    }
    return DefWindowProcA(hWnd, msg, wp, lp);
}

void main() {
    int hInst = GetModuleHandleA(0);
    
    int hCursor = LoadCursorA(0, 32512); // IDC_ARROW
    if (hCursor == 0) {
        MessageBoxA(0, "Failed to load cursor!", "Error", 0);
        // Continue anyway, it might work with default
    }
    
    // WNDCLASSA (10 ints = 80 bytes for safety)
    int wc[16];
    int j = 0;
    while (j < 16) { wc[j] = 0; j++; }
    
    // Layout (assuming int=8 bytes in this compiler)
    wc[0] = 3;           // style
    wc[1] = WndProc;     // lpfnWndProc
    wc[2] = 0;           // cbClsExtra/cbWndExtra
    wc[3] = hInst;       // hInstance
    wc[4] = 0;           // hIcon
    wc[5] = hCursor;     // hCursor 
    wc[6] = 6;           // hbrBackground
    wc[7] = 0;           // Menu
    wc[8] = ClassName;   // ClassName
    
    int atom = RegisterClassA(wc);
    if (atom == 0) {
        char errBuf[64];
        int err = GetLastError();
        sprintf(errBuf, "RegisterClass failed! Err: %d", err);
        MessageBoxA(0, errBuf, "Error", 0);
        ExitProcess(1);
    }
    
    int hWnd = CreateWindowExA(0, ClassName, Title, 13565952, 100, 100, 400, 300, 0, 0, hInst, 0);
    
    if (hWnd == 0) {
        MessageBoxA(0, "CreateWindow failed!", "Error", 0);
        ExitProcess(1);
    }
    
    // Edit (ID 101)
    hEdit = CreateWindowExA(512, "EDIT", "", 0x50800080, 20, 20, 300, 30, hWnd, 101, hInst, 0);
    
    // Button (ID 102)
    CreateWindowExA(0, "BUTTON", "Show Text", 0x50000001, 20, 70, 100, 30, hWnd, 102, hInst, 0);
    
    ShowWindow(hWnd, 5);
    
    int m[8];
    while(GetMessageA(m, 0, 0, 0)) {
        TranslateMessage(m);
        DispatchMessageA(m);
    }
    ExitProcess(0);
}
`;