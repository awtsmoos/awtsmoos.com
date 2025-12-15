/* B"H */
export const source = `; B"H
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
`;