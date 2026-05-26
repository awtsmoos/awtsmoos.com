/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES } from './opcodes.js';
import { CodeBuilder } from './assembler.js';
import { stringToBytes } from './utils.js';

export function createConsoleApp(userMessage) {
    const importDef = [
        {
            name: "KERNEL32.dll\0",
            funcs: ["GetStdHandle\0", "WriteFile\0", "Sleep\0", "ExitProcess\0"]
        }
    ];

    const code = new CodeBuilder();
    const dataBlobs = [];
    
    // Data 0: Message
    const msgBytes = new Uint8Array([...stringToBytes(userMessage), 0x0D, 0x0A, 0x00]);
    dataBlobs.push(msgBytes);

    // --- Code Generation ---
    // Sub RSP, 40 (Align 16 bytes + Shadow Space 32)
    code.addBytes([PREFIXES.REX_W, OPCODES.SUB_RM64_IMM8, 0xEC, 0x28]); 

    // GetStdHandle(STD_OUTPUT_HANDLE = -11)
    code.addBytes([PREFIXES.REX_W, OPCODES.MOV_RM64_IMM32, 0xC1, 0xF5, 0xFF, 0xFF, 0xFF]);
    code.addCall("GetStdHandle\0"); 
    code.addBytes([0x48, 0x89, 0x44, 0x24, 0x38]); // Save Handle to [RSP+0x38]

    // WriteFile(Handle, Buffer, Len, &Written, 0)
    code.addBytes([0x48, 0x8B, 0x4C, 0x24, 0x38]); // RCX = Handle
    code.addLeaRel(0); // RDX = Message (Data Blob 0)
    code.addBytes([PREFIXES.REX_B, 0xB8]); 
    code.add32(msgBytes.length - 1); // R8 = Length
    code.addBytes([0x4C, 0x8D, 0x4C, 0x24, 0x30]); // R9 = &Written (at RSP+30)
    code.addBytes([0x48, 0xC7, 0x44, 0x24, 0x20, 0x00, 0x00, 0x00, 0x00]); // Param5 = NULL
    code.addCall("WriteFile\0"); 

    // Sleep briefly so double-click users can see the console output, then exit.
    code.addBytes([0x48, 0xC7, 0xC1, 0xDC, 0x05, 0x00, 0x00]); // MOV RCX, 1500
    code.addCall("Sleep\0");

    // ExitProcess(0)
    code.addBytes([OPCODES.XOR_RM64_R64, 0xC9]);
    code.addCall("ExitProcess\0");

    return {
        code,
        dataBlobs,
        importDef,
        mode: 'console'
    };
}
