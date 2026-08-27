/* B"H */
export const source = `; B"H
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
MOV RCX, -11      ; STD_OUTPUT_HANDLE
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
`;