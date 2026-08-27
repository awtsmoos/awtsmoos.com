/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES } from './opcodes.js';
import { CodeBuilder } from './assembler.js';
import { stringToBytes } from './utils.js';

export function createGuiApp(userMessage) {
    // Defines imports. 
    // Note: Strings must be null-terminated for the PE builder to write them correctly.
    const importDef = [
        {
            name: "KERNEL32.dll\0",
            funcs: ["ExitProcess\0"]
        },
        {
            name: "USER32.dll\0",
            funcs: ["MessageBoxA\0"]
        }
    ];

    const code = new CodeBuilder();
    const dataBlobs = [];
    
    // Data 0: Message Body
    dataBlobs.push(new Uint8Array([...stringToBytes(userMessage || "Hello from Awtsmoos!\0"), 0])); 
    // Data 1: Caption
    dataBlobs.push(new Uint8Array([...stringToBytes("Awtsmoos GUI\0"), 0])); 

    // --- Code Generation ---
    
    // Stack Alignment
    // Function calls require 16-byte stack alignment *before* the call instruction pushes return address.
    // We also need 32 bytes of shadow space (homing space) for the callee.
    // Total allocation: 40 bytes (0x28).
    // Initial stack (on entry) is misaligned by 8 bytes (Return Address).
    // SUB RSP, 0x28 -> RSP ends in 0x0. (Aligned to 16 bytes).
    code.addBytes([PREFIXES.REX_W, OPCODES.SUB_RM64_IMM8, 0xEC, 0x28]); 

    // MessageBoxA(NULL, lpText, lpCaption, MB_OK)
    // RCX = 0 (hWnd)
    // RDX = lpText (Data 0)
    // R8  = lpCaption (Data 1)
    // R9  = 0 (Type)

    // MOV RCX, 0
    code.addBytes([0x48, 0x31, 0xC9]); 
    
    // LEA RDX, [Data 0]
    code.addLeaRegRel(2, 0); 

    // LEA R8, [Data 1]
    // Note: assembler.js must handle R8 correctly now!
    code.addLeaRegRel(8, 1);

    // MOV R9, 0
    code.addBytes([0x4D, 0x31, 0xC9]);

    // CALL MessageBoxA
    code.addCall("MessageBoxA\0");

    // ExitProcess(0)
    // MOV RCX, 0
    code.addBytes([0x48, 0x31, 0xC9]);
    code.addCall("ExitProcess\0");

    // Restore Stack (technically unreachable, but good practice)
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x28]);
    code.addBytes([OPCODES.RET]);

    return {
        code,
        dataBlobs,
        importDef,
        mode: 'gui'
    };
}