/*
B"H
Boruch Hashem
Biezrash Hashem
*/

export const ASM_EXAMPLES = {
    hello: `; B"H
; Example: GUI Hello World
; -------------------------
.subsystem gui
.import USER32.dll MessageBoxA
.import KERNEL32.dll ExitProcess

.data
title: "B\\"H"
msg: "Welcome to Awtsmoos ASM!"

.code
; 1. Stack Alignment (Odd alignment + Shadow Space)
;    Sub 40 (0x28) => 8 (RetAddr) + 40 = 48 (Align 16)
SUB RSP, 40

; 2. MessageBoxA(hWnd=0, lpText=msg, lpCaption=title, uType=0)
XOR RCX, RCX      ; Arg1: hWnd
LEA RDX, msg      ; Arg2: Text
LEA R8, title     ; Arg3: Caption
XOR R9, R9        ; Arg4: Type
CALL MessageBoxA

; 3. ExitProcess(0)
XOR RCX, RCX
CALL ExitProcess
RET
`,

    loop: `; B"H
; Example: Console Loop
; ---------------------
; Prints a dot '.' to stdout 5 times.
.subsystem console
.import KERNEL32.dll GetStdHandle WriteFile Sleep ExitProcess

.data
dot: "."

.code
; Setup Stack
SUB RSP, 56       ; 40 (Shadow/Align) + 16 (Locals)

; GetStdHandle(-11) -> StdOut
MOV RCX, 0xFFFFFFF5 ; -11
CALL GetStdHandle
MOV RBX, RAX      ; Save Handle in RBX (Non-volatile)

; Initialize Counter (RSI = 5)
MOV RSI, 5

loop_start:
    ; WriteFile(h, &dot, 1, &written, 0)
    MOV RCX, RBX      ; hFile
    LEA RDX, dot      ; lpBuffer
    MOV R8, 1         ; nNumberOfBytesToWrite
    LEA R9, [RSP+48]  ; lpNumberOfBytesWritten (Stack Scratch)
    MOV [RSP+32], 0   ; lpOverlapped = NULL (Stack Arg 5)
    CALL WriteFile
    
    ; Sleep(200ms)
    MOV RCX, 200
    CALL Sleep

    DEC RSI
    JNZ loop_start

; ExitProcess(0)
XOR RCX, RCX
CALL ExitProcess
`,

    file: `; B"H
; Example: File Writer
; --------------------
; Creates 'created_by_asm.txt' and writes to it.
.subsystem console
.import KERNEL32.dll CreateFileA WriteFile CloseHandle ExitProcess

.data
fname: "created_by_asm.txt"
content: "B\\"H - Existence generated from nothingness."

.code
SUB RSP, 104        ; Deep stack for args

; CreateFileA(name, GENERIC_WRITE, 0, 0, CREATE_ALWAYS, 0x80, 0)
LEA RCX, fname      ; Name
MOV RDX, 0x40000000 ; GENERIC_WRITE
XOR R8, R8          ; ShareMode = 0
XOR R9, R9          ; Security = 0
; Stack Args
MOV [RSP+32], 2     ; CREATE_ALWAYS
MOV [RSP+40], 128   ; FILE_ATTRIBUTE_NORMAL
MOV [RSP+48], 0     ; hTemplate
CALL CreateFileA

; Check if valid (RAX != -1)
CMP RAX, 0xFFFFFFFFFFFFFFFF
JE exit_error

; Save Handle
MOV RBX, RAX

; WriteFile(handle, content, len, &written, 0)
MOV RCX, RBX        ; Handle
LEA RDX, content    ; Buffer
MOV R8, 43          ; Length
LEA R9, [RSP+64]    ; &Written
MOV [RSP+32], 0     ; Overlapped
CALL WriteFile

; CloseHandle
MOV RCX, RBX
CALL CloseHandle

exit_error:
XOR RCX, RCX
CALL ExitProcess
`,

    window: `; B"H
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
`,

    draw: `; B"H
; Example: GDI Graphics
; ---------------------
; Draws YELLOW text on DARK GRAY background.
.subsystem gui
.import KERNEL32.dll GetModuleHandleA ExitProcess
.import GDI32.dll GetStockObject SetBkMode SetTextColor
.import USER32.dll RegisterClassA CreateWindowExA ShowWindow GetMessageA
.import USER32.dll TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage
.import USER32.dll BeginPaint EndPaint FillRect DrawTextA GetClientRect

.data
ClassName: "GDIClass"
Title: "B\\"H - Drawing"
TxtMsg: "B\\"H - Awtsmoos Generated This!"

.code
SUB RSP, 296 

; GetModuleHandle
XOR RCX, RCX
CALL GetModuleHandleA
MOV R12, RAX

; RegisterClassA
MOV [RSP+64], 3
LEA RAX, WndProc
MOV [RSP+72], RAX
MOV [RSP+80], 0
MOV [RSP+88], R12
MOV [RSP+96], 0
MOV [RSP+104], 0
MOV [RSP+112], 0          ; NULL Brush (We paint manually)
MOV [RSP+120], 0
LEA RAX, ClassName
MOV [RSP+128], RAX

LEA RCX, [RSP+64]
CALL RegisterClassA

; CreateWindowEx
XOR RCX, RCX
LEA RDX, ClassName
LEA R8, Title
MOV R9, 13565952
MOV [RSP+32], 0x80000000
MOV [RSP+40], 0x80000000
MOV [RSP+48], 600
MOV [RSP+56], 400
MOV [RSP+64], 0
MOV [RSP+72], 0
MOV [RSP+80], R12
MOV [RSP+88], 0
CALL CreateWindowExA
MOV R13, RAX

MOV RCX, R13
MOV RDX, 5
CALL ShowWindow

; Msg Loop
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
    ; RDX = uMsg
    CMP RDX, 2    ; WM_DESTROY
    JE on_destroy
    CMP RDX, 15   ; WM_PAINT
    JE on_paint
    JMP DefWindowProcA

on_destroy:
    SUB RSP, 40
    MOV RCX, 0
    CALL PostQuitMessage
    XOR RAX, RAX
    ADD RSP, 40
    RET

on_paint:
    ; Prologue: Save Non-Volatile Registers
    PUSH RBX
    PUSH RSI
    PUSH RDI
    
    ; Stack Frame Layout:
    ; +0 to +32   : Shadow Space (Args 1-4)
    ; +32         : Arg 5 Slot
    ; +40         : PAINTSTRUCT (64 bytes) -> [RSP+40]..[RSP+104]
    ; +112        : RECT (16 bytes)        -> [RSP+112]..[RSP+128]
    ; 
    ; Alignment:
    ; Entry: RSP%16 == 8 (RetAddr)
    ; 3 Pushes: RSP%16 == 8 (8+24=32)
    ; Need (SUB_AMOUNT) % 16 == 0.
    ; Allocation: 144 bytes.
    SUB RSP, 144
    
    MOV RBX, RCX      ; Save hWnd
    
    ; BeginPaint(hWnd, &ps)
    LEA RDX, [RSP+40] ; &ps
    CALL BeginPaint
    MOV RSI, RAX      ; RSI = hDC

    ; GetClientRect(hWnd, &rect)
    ; This ensures we have the full window size, not just the update region.
    MOV RCX, RBX      ; hWnd
    LEA RDX, [RSP+112]; &rect
    CALL GetClientRect

    ; FillRect(hDC, &rect, DKGRAY_BRUSH)
    ; DKGRAY_BRUSH = 3
    MOV RCX, 3        
    CALL GetStockObject
    MOV RDI, RAX      ; Brush
    
    MOV RCX, RSI      ; hDC
    LEA RDX, [RSP+112]; &rect
    MOV R8, RDI       ; hBrush
    CALL FillRect
    
    ; SetTextColor(hDC, YELLOW)
    ; 0x00BBGGRR -> 0x0000FFFF (Red+Green=Yellow)
    MOV RCX, RSI
    MOV RDX, 0x0000FFFF 
    CALL SetTextColor
    
    ; SetBkMode(hDC, TRANSPARENT)
    MOV RCX, RSI
    MOV RDX, 1          ; TRANSPARENT
    CALL SetBkMode

    ; DrawTextA(hDC, Txt, -1, &rect, Format)
    ; Format: DT_CENTER|DT_VCENTER|DT_SINGLELINE = 0x25
    MOV RCX, RSI        ; hDC
    LEA RDX, TxtMsg     ; lpString
    MOV R8, 0xFFFFFFFFFFFFFFFF ; -1
    LEA R9, [RSP+112]   ; &rect (Use Client Rect)
    MOV [RSP+32], 0x25  ; Arg5
    CALL DrawTextA

    ; EndPaint(hWnd, &ps)
    MOV RCX, RBX
    LEA RDX, [RSP+40]
    CALL EndPaint

    ; Epilogue
    ADD RSP, 144
    POP RDI
    POP RSI
    POP RBX
    
    XOR RAX, RAX
    RET
`
};