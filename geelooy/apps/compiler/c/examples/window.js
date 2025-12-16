/* B"H */
export const source = `// B"H
#include <stdio.h>
import "USER32.dll" RegisterClassA CreateWindowExA ShowWindow GetMessageA TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage MessageBoxA;
import "KERNEL32.dll" GetModuleHandleA;

// Global Name
char* ClassName = "MyCWin";
char* Title = "B\\"H - C Window";
char* BtnClass = "BUTTON";
char* BtnText = "Click Me";

// We can't use a switch statement in this simplified C parser, so we use if/else.
int WndProc(int hWnd, int msg, int wp, int lp) {
    // WM_DESTROY = 2
    if (msg == 2) { 
        PostQuitMessage(0);
        return 0;
    }
    
    // WM_COMMAND = 273 (0x111)
    if (msg == 273) {
        // If button clicked (ID 101)
        if (wp == 101) {
             MessageBoxA(hWnd, "Button Clicked!", "B\\"H", 0);
        }
    }
    
    return DefWindowProcA(hWnd, msg, wp, lp);
}

void main() {
    int hInstance = GetModuleHandleA(0);
    
    // Allocate WNDCLASSA on stack
    // In this compiler, 'int' local vars are 8 bytes (64-bit).
    // WNDCLASSA layout (72 bytes aligned to 8):
    // 0: style (4) + pad
    // 1: lpfnWndProc (8)
    // 2: cbClsExtra (4) + cbWndExtra (4)  <- Packed into one 8-byte slot
    // 3: hInstance (8)
    // 4: hIcon (8)
    // 5: hCursor (8)
    // 6: hbrBackground (8)
    // 7: lpszMenuName (8)
    // 8: lpszClassName (8)
    
    int wc[10]; 
    wc[0] = 3;           // style
    wc[1] = WndProc;     // lpfnWndProc
    wc[2] = 0;           // cbClsExtra & cbWndExtra
    wc[3] = hInstance;   // hInstance
    wc[4] = 0;           // hIcon
    wc[5] = 0;           // hCursor
    wc[6] = 6;           // hbrBackground
    wc[7] = 0;           // Menu
    wc[8] = ClassName;   // ClassName
    
    RegisterClassA(wc);
    
    // CreateWindowExA
    int hWnd = CreateWindowExA(
        0, ClassName, Title, 
        13565952, // WS_OVERLAPPEDWINDOW
        0x80000000, 0x80000000, 600, 400,
        0, 0, hInstance, 0
    );
    
    // Create Button
    // Style: WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON (0x50000001)
    CreateWindowExA(
        0, BtnClass, BtnText,
        0x50000001,
        20, 20, 100, 30,
        hWnd, 101, hInstance, 0
    );
    
    ShowWindow(hWnd, 5);
    
    // MSG struct
    int msg[8];
    while (GetMessageA(msg, 0, 0, 0)) {
        TranslateMessage(msg);
        DispatchMessageA(msg);
    }
    
    exit(0);
}
`;