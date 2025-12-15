/* B"H */
export const source = `; B"H
; Example: Native Window
; -----------------------
; Registers a class, creates a window, and handles messages.
.subsystem gui
.import KERNEL32.dll GetModuleHandleA ExitProcess
.import USER32.dll RegisterClassA CreateWindowExA ShowWindow UpdateWindow GetMessageA
.import USER32.dll TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage

.data
ClassName: "MyWinClass"
Title: "B\\"H - Native Window"

.code
; Stack: Align(8->16) + Shadow(32) + WNDCLASS(80) + MSG(48) = > Align 16
SUB RSP, 296 

; 1. GetModuleHandle(0)
XOR RCX, RCX
CALL GetModuleHandleA
MOV R12, RAX     ; R12 = hInstance

; 2. Setup WNDCLASSA (at RSP+64)
; Layout: style, WndProc, cbCls, cbWnd, hInst, hIcon, hCursor, hBr, Menu, Name
MOV [RSP+64], 3           ; CS_HREDRAW | CS_VREDRAW
LEA RAX, WndProc
MOV [RSP+72], RAX         ; lpfnWndProc
MOV [RSP+80], 0           ; cbCls/Wnd
MOV [RSP+88], R12         ; hInstance
MOV [RSP+96], 0           ; hIcon
MOV [RSP+104], 0          ; hCursor
MOV [RSP+112], 6          ; hbrBackground (COLOR_WINDOW+1)
MOV [RSP+120], 0          ; MenuName
LEA RAX, ClassName
MOV [RSP+128], RAX        ; ClassName

LEA RCX, [RSP+64]         ; &WndClass
CALL RegisterClassA

; 3. CreateWindowEx
; Stack args start at RSP+32
XOR RCX, RCX              ; ExStyle
LEA RDX, ClassName        ; Class
LEA R8, Title             ; Window Name
MOV R9, 13565952          ; WS_OVERLAPPEDWINDOW

MOV [RSP+32], 0x80000000  ; X (CW_USEDEFAULT)
MOV [RSP+40], 0x80000000  ; Y
MOV [RSP+48], 600         ; W
MOV [RSP+56], 400         ; H
MOV [RSP+64], 0           ; Parent
MOV [RSP+72], 0           ; Menu
MOV [RSP+80], R12         ; hInstance
MOV [RSP+88], 0           ; lpParam

CALL CreateWindowExA
MOV R13, RAX              ; R13 = hWnd

; ShowWindow(hWnd, SW_SHOW)
MOV RCX, R13
MOV RDX, 5
CALL ShowWindow

; Message Loop
; MSG struct at RSP+144
msg_loop:
    LEA RCX, [RSP+144]
    XOR RDX, RDX
    XOR R8, R8
    XOR R9, R9
    CALL GetMessageA
    
    CMP RAX, 0
    JE exit_app
    
    LEA RCX, [RSP+144]
    CALL TranslateMessage
    LEA RCX, [RSP+144]
    CALL DispatchMessageA
    JMP msg_loop

exit_app:
    MOV RCX, 0
    CALL ExitProcess

; --- WndProc ---
WndProc:
    ; RCX=hWnd, RDX=uMsg, R8=wParam, R9=lParam
    CMP RDX, 2    ; WM_DESTROY
    JE on_destroy
    
    JMP DefWindowProcA

on_destroy:
    SUB RSP, 40
    MOV RCX, 0
    CALL PostQuitMessage
    XOR RAX, RAX
    ADD RSP, 40
    RET
`;