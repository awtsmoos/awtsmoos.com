/* B"H */
export const source = `; B"H
; Example: GDI Graphics (Guaranteed Fix)
; --------------------------------------
; Draws a Red Diagonal Line (SetPixel) and Yellow Text (TextOut).
; Demonstrates "OpenGL-style" manual pixel plotting + GDI Text.
; --------------------------------------

.subsystem gui
.import KERNEL32.dll GetModuleHandleA ExitProcess
.import GDI32.dll GetStockObject SetBkMode SetTextColor SelectObject TextOutA SetPixel
.import USER32.dll RegisterClassA CreateWindowExA ShowWindow GetMessageA
.import USER32.dll TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage
.import USER32.dll BeginPaint EndPaint FillRect

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
MOV [RSP+64], 3           ; CS_HREDRAW | CS_VREDRAW
LEA RAX, WndProc
MOV [RSP+72], RAX
MOV [RSP+80], 0
MOV [RSP+88], R12
MOV [RSP+96], 0
MOV [RSP+104], 0
MOV [RSP+112], 0          ; NULL Brush
MOV [RSP+120], 0
LEA RAX, ClassName
MOV [RSP+128], RAX

LEA RCX, [RSP+64]
CALL RegisterClassA

; CreateWindowEx
XOR RCX, RCX
LEA RDX, ClassName
LEA R8, Title
MOV R9, 13565952          ; WS_OVERLAPPEDWINDOW
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
    PUSH RBX
    PUSH RSI
    PUSH RDI
    SUB RSP, 144
    
    MOV RBX, RCX      ; Save hWnd
    
    ; BeginPaint(hWnd, &ps)
    LEA RDX, [RSP+40]
    CALL BeginPaint
    MOV RSI, RAX      ; RSI = hDC

    ; 1. Fill Background (Dark Gray = 3)
    MOV RCX, 3
    CALL GetStockObject
    MOV RDI, RAX      ; Brush Handle
    
    MOV RCX, RSI
    LEA RDX, [RSP+52] ; &ps.rcPaint
    MOV R8, RDI
    CALL FillRect

    ; 2. Set Text Color (Yellow = 0x00FFFF)
    MOV RCX, RSI
    MOV RDX, 65535    ; 0x00FFFF
    CALL SetTextColor

    ; 3. Set Back Mode (Transparent = 1)
    MOV RCX, RSI
    MOV RDX, 1
    CALL SetBkMode

    ; 4. Select Good Font (SYSTEM_FIXED_FONT = 16 or ANSI_VAR = 12)
    MOV RCX, 16       ; SYSTEM_FIXED_FONT
    CALL GetStockObject
    MOV RCX, RSI
    MOV RDX, RAX
    CALL SelectObject

    ; 5. TextOutA(hDC, x, y, string, length)
    ;    Avoids clipping issues of DrawText
    MOV RCX, RSI      ; Arg1: hDC
    MOV RDX, 50       ; Arg2: X
    MOV R8, 50        ; Arg3: Y
    LEA R9, TxtMsg    ; Arg4: String
    MOV [RSP+32], 31  ; Arg5: Length (Stack)
    CALL TextOutA

    ; 6. Manual Pixel Plotting (Diagonal Line)
    ;    Draws a RED line from (20,20) to (220,220)
    ;    RDI = Loop Counter
    MOV RDI, 20
pixel_loop:
    CMP RDI, 220
    JGE pixel_done

    ; SetPixel(hDC, x, y, color)
    MOV RCX, RSI      ; hDC
    MOV RDX, RDI      ; x
    MOV R8, RDI       ; y
    MOV R9, 255       ; Color: Red (0x000000FF)
    CALL SetPixel

    INC RDI
    JMP pixel_loop

pixel_done:

    ; EndPaint(hWnd, &ps)
    MOV RCX, RBX
    LEA RDX, [RSP+40]
    CALL EndPaint

    ADD RSP, 144
    POP RDI
    POP RSI
    POP RBX
    XOR RAX, RAX
    RET
`;