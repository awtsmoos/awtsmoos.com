/* B"H */

const sinTable = [];
for (let i = 0; i < 256; i++) {
    const rad = (i / 256) * Math.PI * 2;
    const val = Math.round(Math.sin(rad) * 127);
    sinTable.push(val);
}
for(let i=0; i<8; i++) sinTable.push(0); 
const sinBytes = sinTable.join(", ");

const BMI = [
    40, 0, 0, 0,
    0x58, 0x02, 0, 0,
    0xA8, 0xFD, 0xFF, 0xFF,
    1, 0, 32, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
].join(",");

export const source = `;B"H
; Example: Animated Triangle (Double-Sided)
.subsystem gui
.import KERNEL32.dll GetModuleHandleA ExitProcess
.import USER32.dll RegisterClassA CreateWindowExA ShowWindow GetMessageA LoadCursorA
.import USER32.dll TranslateMessage DispatchMessageA DefWindowProcA PostQuitMessage
.import USER32.dll GetDC ReleaseDC InvalidateRect SetTimer
.import GDI32.dll CreateCompatibleDC CreateDIBSection SelectObject BitBlt DeleteObject DeleteDC

.data
ClassName: "TriWin"
Title: "B\\"H - Rotating Triangle"
Angle: 0, 0, 0, 0, 0, 0, 0, 0
SinTable: ${sinBytes}
BitmapInfo: ${BMI}
PixelsPtr: 0, 0, 0, 0, 0, 0, 0, 0
HMemDC: 0, 0, 0, 0, 0, 0, 0, 0
HBitmap: 0, 0, 0, 0, 0, 0, 0, 0
WindowDC: 0, 0, 0, 0, 0, 0, 0, 0
; X1, Y1, X2, Y2, X3, Y3
TriVerts: 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0

.code
SUB RSP, 296 

; Window Init
XOR RCX, RCX
CALL GetModuleHandleA
MOV R12, RAX

XOR RCX, RCX
MOV RDX, 32512
CALL LoadCursorA
MOV R13, RAX

MOV [RSP+64], 3
LEA RAX, WndProc
MOV [RSP+72], RAX
MOV [RSP+80], 0
MOV [RSP+88], R12
MOV [RSP+96], 0
MOV [RSP+104], R13
MOV [RSP+112], 0
MOV [RSP+120], 0
LEA RAX, ClassName
MOV [RSP+128], RAX
LEA RCX, [RSP+64]
CALL RegisterClassA

XOR RCX, RCX
LEA RDX, ClassName
LEA R8, Title
MOV R9, 13565952
MOV [RSP+32], 0x80000000
MOV [RSP+40], 0x80000000
MOV [RSP+48], 600
MOV [RSP+56], 600
MOV [RSP+64], 0
MOV [RSP+72], 0
MOV [RSP+80], R12
MOV [RSP+88], 0
CALL CreateWindowExA
MOV R13, RAX

; GDI Setup
MOV RCX, R13
CALL GetDC
MOV [WindowDC], RAX
MOV RBX, RAX
MOV RCX, RBX
CALL CreateCompatibleDC
MOV [HMemDC], RAX
MOV RSI, RAX
MOV RCX, RSI
LEA RDX, BitmapInfo
MOV R8, 0
LEA R9, PixelsPtr
MOV [RSP+32], 0
MOV [RSP+40], 0
CALL CreateDIBSection
MOV [HBitmap], RAX
MOV RCX, RSI
MOV RDX, RAX
CALL SelectObject
MOV RCX, R13
MOV RDX, 5
CALL ShowWindow
MOV RCX, R13
MOV RDX, 1
MOV R8, 16
MOV R9, 0
CALL SetTimer

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

WndProc:
    CMP RDX, 2
    JE on_destroy
    CMP RDX, 275
    JE on_timer
    JMP DefWindowProcA

on_destroy:
    SUB RSP, 40
    MOV RCX, 0
    CALL PostQuitMessage
    ADD RSP, 40
    RET

on_timer:
    PUSH RDI
    PUSH RSI
    PUSH RBX
    SUB RSP, 120
    
    ; Update Angle
    LEA RAX, Angle
    MOV R10, [RAX]
    ADD R10, 2
    MOV [RAX], R10

    ; Clear Screen (Dark Gray 0x00333333 to verify drawing)
    MOV RDI, [PixelsPtr]
    MOV RCX, 360000
    MOV EAX, 0x00333333
    REP STOSD

    ; Update Vertices
    CALL CalcVerts

    ; Rasterize
    CALL Rasterize

    ; Blit
    MOV RCX, [WindowDC]
    XOR RDX, RDX
    XOR R8, R8
    MOV R9, 600
    MOV [RSP+32], 600
    MOV RAX, [HMemDC]
    MOV [RSP+40], RAX
    MOV [RSP+48], 0
    MOV [RSP+56], 0
    MOV [RSP+64], 0xCC0020
    CALL BitBlt

    ADD RSP, 120
    POP RBX
    POP RSI
    POP RDI
    XOR RAX, RAX
    RET

CalcVerts:
    LEA R11, Angle
    MOV R10, [R11]
    LEA RDI, TriVerts
    
    ; Vertex 1 (Angle)
    MOV RCX, R10
    CALL CalcPoint
    MOV [RDI], RAX
    MOV [RDI+8], RBX

    ; Vertex 2 (Angle + 120) - 1/3 rotation
    MOV RCX, R10   ; Reload Angle
    ADD RCX, 85    ; Approx 120 deg (85/256 * 360)
    CALL CalcPoint
    MOV [RDI+16], RAX
    MOV [RDI+24], RBX

    ; Vertex 3 (Angle + 240) - 2/3 rotation
    MOV RCX, R10   ; Reload Angle
    ADD RCX, 170   ; Approx 240 deg
    CALL CalcPoint
    MOV [RDI+32], RAX
    MOV [RDI+40], RBX
    RET

CalcPoint:
    AND RCX, 0xFF
    LEA RDX, SinTable
    LEA RAX, [RDX + RCX]
    MOVSX R8, [RAX]   ; Sin
    
    ADD RCX, 64
    AND RCX, 0xFF
    LEA RAX, [RDX + RCX]
    MOVSX R9, [RAX]   ; Cos
    
    ; X = 300 + (Cos * 200) / 128
    MOV RAX, R9
    IMUL RAX, 200
    SAR RAX, 7
    ADD RAX, 300
    
    ; Y = 300 - (Sin * 200) / 128
    MOV RBX, R8
    IMUL RBX, 200
    SAR RBX, 7
    MOV RDX, 300
    SUB RDX, RBX
    MOV RBX, RDX
    RET

Rasterize:
    PUSH RBX
    PUSH RSI
    PUSH RDI
    PUSH R12
    PUSH R13
    PUSH R14
    PUSH R15
    
    LEA RSI, TriVerts
    MOV R8,  [RSI]    ; X1
    MOV R9,  [RSI+8]  ; Y1
    MOV R10, [RSI+16] ; X2
    MOV R11, [RSI+24] ; Y2
    MOV R12, [RSI+32] ; X3
    MOV R13, [RSI+40] ; Y3

    ; Bounding Box (0-599)
    MOV R14, 0
    MOV R15, 599
    MOV RSI, 0
    MOV RDI, 599

    ; For each Y
loop_y:
    CMP RSI, RDI
    JG end_raster
    
    ; For each X
    MOV RBX, R14
loop_x:
    CMP RBX, R15
    JG next_line

    ; Edge 1 (P vs V1-V2)
    ; (Px - X1)*(Y2 - Y1) - (Py - Y1)*(X2 - X1)
    MOV RAX, RBX
    SUB RAX, R8
    MOV RCX, R11
    SUB RCX, R9
    IMUL RAX, RCX  ; A*B
    
    MOV RCX, RSI
    SUB RCX, R9
    MOV RDX, R10
    SUB RDX, R8
    IMUL RCX, RDX  ; C*D
    
    SUB RAX, RCX
    MOV RBP, RAX   ; E1

    ; Edge 2 (P vs V2-V3)
    MOV RAX, RBX
    SUB RAX, R10
    MOV RCX, R13
    SUB RCX, R11
    IMUL RAX, RCX
    
    MOV RCX, RSI
    SUB RCX, R11
    MOV RDX, R12
    SUB RDX, R10
    IMUL RCX, RDX
    
    SUB RAX, RCX
    MOV RDX, RAX   ; E2

    ; Edge 3 (P vs V3-V1)
    MOV RAX, RBX
    SUB RAX, R12
    MOV RCX, R9
    SUB RCX, R13
    IMUL RAX, RCX
    
    MOV RCX, RSI
    SUB RCX, R13
    MOV RDX, R8
    SUB RDX, R12
    IMUL RCX, RDX
    
    SUB RAX, RCX   ; E3 (In RAX)
    
    ; Check Inside (All Positive OR All Negative)
    ; 1. Check All Positive
    MOV R11, RBP
    OR R11, RDX
    OR R11, RAX
    CMP R11, 0
    JGE draw_pixel
    
    ; 2. Check All Negative (Sign bit set in all)
    ; If (E1 & E2 & E3) has sign bit set, then ALL have sign bit set (are negative)
    MOV R11, RBP
    AND R11, RDX
    AND R11, RAX
    CMP R11, 0
    JL draw_pixel
    
    JMP skip_pixel
    
draw_pixel:
    MOV RCX, RSI
    IMUL RCX, 600
    ADD RCX, RBX
    SHL RCX, 2
    MOV RDX, [PixelsPtr]
    ADD RDX, RCX
    MOV DWORD PTR [RDX], 0x00FFFFFF

skip_pixel:
    INC RBX
    JMP loop_x

next_line:
    INC RSI
    JMP loop_y

end_raster:
    POP R15
    POP R14
    POP R13
    POP R12
    POP RDI
    POP RSI
    POP RBX
    RET
`