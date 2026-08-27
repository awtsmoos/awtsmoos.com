/* B"H */
export const source = `; B"H
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
CMP RAX, -1         ; Check for INVALID_HANDLE_VALUE
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
`;