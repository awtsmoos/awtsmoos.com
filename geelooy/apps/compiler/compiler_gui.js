/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES } from './opcodes.js';
import { CodeBuilder } from './assembler.js';
import { stringToBytes } from './utils.js';

export function createGuiApp(userMessage) {
    const importDef = [
        {
            name: "KERNEL32.dll\0",
            funcs: ["ExitProcess\0", "GetModuleHandleA\0"]
        },
        {
            name: "USER32.dll\0",
            funcs: [
                "RegisterClassA\0", "CreateWindowExA\0", "GetMessageA\0", 
                "DispatchMessageA\0", "DefWindowProcA\0", "PostQuitMessage\0",
                "BeginPaint\0", "EndPaint\0", "FillRect\0", "LoadCursorA\0"
            ]
        }
    ];

    const code = new CodeBuilder();
    const dataBlobs = [];
    
    // Data 0: ClassName
    dataBlobs.push(new Uint8Array([...stringToBytes("AwtsmoosClass\0")])); 
    // Data 1: WindowTitle
    dataBlobs.push(new Uint8Array([...stringToBytes(userMessage || "Awtsmoos Window\0"), 0])); 
    // Data 2: WNDCLASSA Struct (72 bytes)
    dataBlobs.push(new Uint8Array(72)); 
    // Data 3: MSG Struct (48 bytes)
    dataBlobs.push(new Uint8Array(48)); 
    // Data 4: PAINTSTRUCT (64 bytes)
    dataBlobs.push(new Uint8Array(64));
    // Data 5: RECT (16 bytes) {50, 50, 300, 200}
    const rect = new Uint8Array(16);
    const rv = new DataView(rect.buffer);
    rv.setInt32(0, 50, true);
    rv.setInt32(4, 50, true);
    rv.setInt32(8, 300, true);
    rv.setInt32(12, 200, true);
    dataBlobs.push(rect);

    // --- Code Generation ---
    // Entry Point:
    // We must preserve Non-Volatile registers: RBX, RDI, RSI, R12-R15, RBP.
    // We use RBX (for struct base) and RDI (for hInstance).
    // Stack Align: 
    // Call pushes 8 (RetAddr). RSP ends in 8.
    // PUSH RBX (8) -> RSP ends in 0.
    // PUSH RDI (8) -> RSP ends in 8.
    // SUB RSP, 40 (0x28) -> RSP ends in 8 - 40 = -32 (0 mod 16).
    // Correct.
    
    code.addBytes([0x53]); // PUSH RBX
    code.addBytes([0x57]); // PUSH RDI
    code.addBytes([PREFIXES.REX_W, OPCODES.SUB_RM64_IMM8, 0xEC, 0x28]); 

    // GetModuleHandle(0)
    code.addBytes([OPCODES.XOR_RM64_R64, 0xC9]); // RCX = 0
    code.addCall("GetModuleHandleA\0");
    // RAX = hInstance
    code.addBytes([0x48, 0x89, 0xC7]); // MOV RDI, RAX (Save hInstance)

    // LoadCursorA(0, IDC_ARROW=32512)
    code.addBytes([0x48, 0x31, 0xC9]); // RCX = 0
    code.addBytes([0xBA, 0x00, 0x7F, 0x00, 0x00]); // RDX = 32512
    code.addCall("LoadCursorA\0");
    // RAX = hCursor

    // Fill WNDCLASSA (Data 2)
    // LEA RBX, [WNDCLASSA]
    code.addLeaRegRel(3, 2); 
    
    // MOV [RBX+24], RDI (hInstance)
    code.addBytes([0x48, 0x89, 0x7B, 0x18]); 

    // MOV [RBX+40], RAX (hCursor)
    code.addBytes([0x48, 0x89, 0x43, 0x28]); 

    // Set hbrBackground (Offset 48/0x30). COLOR_WINDOW+1 = 6.
    code.addBytes([0x48, 0xC7, 0x43, 0x30, 0x06, 0x00, 0x00, 0x00]);

    // Set lpfnWndProc (Offset 8) -> Point to "WndProc" label
    code.addLeaLabel(0, "WndProc"); // LEA RAX, [WndProc]
    code.addBytes([0x48, 0x89, 0x43, 0x08]);

    // Set lpszClassName (Offset 64) -> Data 0
    code.addLeaRegRel(0, 0); // LEA RAX, [ClassName]
    code.addBytes([0x48, 0x89, 0x43, 0x40]); 

    // RegisterClassA(&wndClass)
    code.addBytes([0x48, 0x89, 0xD9]); // MOV RCX, RBX
    code.addCall("RegisterClassA\0");

    // CreateWindowExA
    // Stack Adjustment: SUB RSP, 0x60 (96 bytes). 
    // Current RSP is aligned (0 mod 16).
    // SUB 96 -> Aligned.
    // Call pushes 8 -> 8 mod 16 (Correct for callee).
    code.addBytes([PREFIXES.REX_W, OPCODES.SUB_RM64_IMM8, 0xEC, 0x60]);

    // Args 12-5
    // Param 12: lpParam = 0
    code.addBytes([0x48, 0xC7, 0x84, 0x24, 0x58, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]); 
    // Param 11: hInstance = RDI
    code.addBytes([0x48, 0x89, 0xBC, 0x24, 0x50, 0x00, 0x00, 0x00]);
    // Param 10: hMenu = 0
    code.addBytes([0x48, 0xC7, 0x84, 0x24, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    // Param 9: hWndParent = 0
    code.addBytes([0x48, 0xC7, 0x84, 0x24, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    // Param 8: Height = 400
    code.addBytes([0xC7, 0x84, 0x24, 0x38, 0x00, 0x90, 0x01, 0x00, 0x00]);
    // Param 7: Width = 500
    code.addBytes([0xC7, 0x84, 0x24, 0x30, 0x00, 0xF4, 0x01, 0x00, 0x00]);
    // Param 6: Y = CW_USEDEFAULT (0x80000000)
    code.addBytes([0xC7, 0x84, 0x24, 0x28, 0x00, 0x00, 0x00, 0x00, 0x80]);
    // Param 5: X = CW_USEDEFAULT
    code.addBytes([0xC7, 0x84, 0x24, 0x20, 0x00, 0x00, 0x00, 0x00, 0x80]);

    // Registers
    // R9 (Style) = WS_OVERLAPPEDWINDOW | WS_VISIBLE (0x10000000)
    code.addBytes([0x41, 0xB9, 0x00, 0x00, 0xCF, 0x10]);
    // R8 (WindowName)
    code.addLeaRegRel(8, 1);
    // RDX (ClassName)
    code.addLeaRegRel(2, 0);
    // RCX (ExStyle) = 0
    code.addBytes([0x48, 0x31, 0xC9]);

    code.addCall("CreateWindowExA\0");
    
    // Restore Stack (Add 0x60)
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x60]);

    // --- Message Loop ---
    code.markLabel("MsgLoop");
    
    // GetMessage(&msg, 0, 0, 0)
    code.addLeaRegRel(1, 3); // RCX = &MSG
    code.addBytes([0x48, 0x31, 0xD2]); // RDX = 0
    code.addBytes([0x49, 0x31, 0xC0]); // R8 = 0
    code.addBytes([0x49, 0x31, 0xC9]); // R9 = 0
    code.addCall("GetMessageA\0");

    // Check Return Value
    // 0 = WM_QUIT -> Exit
    // -1 = Error -> Exit
    code.addBytes([0x48, 0x85, 0xC0]); // TEST RAX, RAX
    code.addJumpRel8(OPCODES.JE_REL8, "ExitApp");
    
    // CMP RAX, -1
    code.addBytes([0x48, 0x83, 0xF8, 0xFF]); 
    code.addJumpRel8(OPCODES.JE_REL8, "ExitApp");

    // DispatchMessage(&msg)
    code.addLeaRegRel(1, 3); // RCX = &MSG
    code.addCall("DispatchMessageA\0");
    
    code.addJumpRel8(OPCODES.JMP_REL8, "MsgLoop");

    code.markLabel("ExitApp");
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x28]); // ADD RSP, 40
    code.addBytes([0x5F]); // POP RDI
    code.addBytes([0x5B]); // POP RBX
    code.addBytes([OPCODES.XOR_RM64_R64, 0xC9]);
    code.addCall("ExitProcess\0");

    // --- WndProc Function ---
    code.markLabel("WndProc");
    // Frame: SUB RSP, 40
    code.addBytes([PREFIXES.REX_W, OPCODES.SUB_RM64_IMM8, 0xEC, 0x28]);
    
    // RCX=Hwnd, RDX=Msg, R8=WParam, R9=LParam
    
    // CMP RDX, WM_DESTROY (2)
    code.addBytes([0x48, 0x83, 0xFA, 0x02]);
    code.addJumpRel8(OPCODES.JE_REL8, "OnDestroy");
    
    // CMP RDX, WM_PAINT (0x0F)
    code.addBytes([0x48, 0x83, 0xFA, 0x0F]);
    code.addJumpRel8(OPCODES.JE_REL8, "OnPaint");

    // Default: DefWindowProcA
    code.addCall("DefWindowProcA\0");
    
    // Exit WndProc
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x28]); // Add RSP, 40
    code.addBytes([OPCODES.RET]);

    code.markLabel("OnDestroy");
    code.addBytes([0x48, 0x31, 0xC9]); // RCX = 0
    code.addCall("PostQuitMessage\0");
    code.addBytes([0x48, 0x31, 0xC0]); // RAX = 0
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x28]);
    code.addBytes([OPCODES.RET]);

    code.markLabel("OnPaint");
    // Save HWND (RCX) to Stack [RSP+32] (Safe space)
    code.addBytes([0x48, 0x89, 0x4C, 0x24, 0x20]);
    
    // BeginPaint(hwnd, &ps)
    code.addLeaRegRel(2, 4); // RDX = &PAINTSTRUCT
    code.addCall("BeginPaint\0");
    // RAX = HDC.
    code.addBytes([0x48, 0x89, 0xC1]); // RCX = HDC

    // FillRect(hdc, &rect, hbrush)
    code.addLeaRegRel(2, 5); // RDX = &RECT
    // R8 = Brush (COLOR_ACTIVECAPTION=2 + 1 = 3)
    code.addBytes([0x49, 0xC7, 0xC0, 0x03, 0x00, 0x00, 0x00]); 
    code.addCall("FillRect\0");

    // EndPaint(hwnd, &ps)
    code.addBytes([0x48, 0x8B, 0x4C, 0x24, 0x20]); // Restore HWND
    code.addLeaRegRel(2, 4); // RDX = &PAINTSTRUCT
    code.addCall("EndPaint\0");

    code.addBytes([0x48, 0x31, 0xC0]); // RAX = 0
    code.addBytes([PREFIXES.REX_W, 0x83, 0xC4, 0x28]);
    code.addBytes([OPCODES.RET]);

    return {
        code,
        dataBlobs,
        importDef,
        mode: 'gui'
    };
}
