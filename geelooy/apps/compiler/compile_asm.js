/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, REGISTERS, makeModRM, MOD } from './opcodes.js';
import { CodeBuilder } from './assembler.js';
import { stringToBytes } from './utils.js';

/**
 * Parses ASM text and generates an artifact.
 * @param {string} source 
 */
export function createCustomAsmApp(source) {
    const code = new CodeBuilder();
    const dataBlobs = [];
    const importDef = [];
    const importMap = new Map(); // DLL Name -> Object
    
    // Symbol tables
    const dataSymbols = new Map(); // Label -> index in dataBlobs
    const codeLabels = new Set();  // Labels defined in code

    // 1. Pre-process: Clean comments and split lines
    const lines = source.split('\n').map(l => {
        const commentIdx = l.indexOf(';');
        if (commentIdx !== -1) return l.substring(0, commentIdx).trim();
        return l.trim();
    }).filter(l => l.length > 0);

    let currentSection = 'code'; // Default

    // 2. Parse Loop
    for (let line of lines) {
        // Directive Check
        if (line.startsWith('.')) {
            const parts = line.split(/\s+/);
            const directive = parts[0].toLowerCase();
            if (directive === '.import') {
                // .import DLL FUNC
                const dll = parts[1];
                const func = parts[2]; // Assumes single function per line for simplicity
                if (!dll || !func) throw new Error("Invalid import: " + line);
                
                // Normalize DLL name (add null if needed later, but import manager handles strings)
                // Actually, import manager expects "NAME\0".
                const dllKey = dll.endsWith('\0') ? dll : dll + '\0';
                const funcKey = func.endsWith('\0') ? func : func + '\0';

                let def = importMap.get(dllKey);
                if (!def) {
                    def = { name: dllKey, funcs: [] };
                    importMap.set(dllKey, def);
                    importDef.push(def);
                }
                def.funcs.push(funcKey);

            } else if (directive === '.data') {
                currentSection = 'data';
            } else if (directive === '.code') {
                currentSection = 'code';
            }
            continue;
        }

        if (currentSection === 'data') {
            // Parse Data: Label: "String"
            // Regex: name: "content"
            const match = line.match(/^(\w+):\s*"(.*)"$/);
            if (match) {
                const label = match[1];
                let content = match[2];
                // Handle basic escapes
                content = content.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                
                // Add null terminator
                const bytes = new Uint8Array([...stringToBytes(content), 0]);
                dataSymbols.set(label, dataBlobs.length);
                dataBlobs.push(bytes);
            } else {
                throw new Error("Invalid data definition: " + line);
            }
            continue;
        }

        if (currentSection === 'code') {
            // Check for Label Definition: "Label:"
            if (line.endsWith(':')) {
                const label = line.slice(0, -1);
                code.markLabel(label);
                codeLabels.add(label);
                continue;
            }

            // Instruction Parsing
            // Mnemonic Op1, Op2...
            const parts = line.split(/[\s,]+/).filter(x => x);
            const mnemonic = parts[0].toUpperCase();
            const args = parts.slice(1);

            emitInstruction(code, mnemonic, args, dataSymbols);
        }
    }

    return {
        code,
        dataBlobs,
        importDef,
        mode: 'gui' // Default to GUI subsystem for safety, or we can check imports.
    };
}

/**
 * Emits machine code for a single instruction.
 */
function emitInstruction(code, mnemonic, args, dataSymbols) {
    const parseOperand = (arg) => {
        if (!arg) return null;
        
        // Register?
        const up = arg.toUpperCase();
        if (REGISTERS[up] !== undefined) {
            return { type: 'reg', val: REGISTERS[up] };
        }

        // Immediate? (Hex or Dec)
        if (arg.match(/^-?0x[0-9A-Fa-f]+$/) || arg.match(/^-?\d+$/)) {
            return { type: 'imm', val: parseInt(arg) };
        }

        // Label? (Data or Code)
        if (dataSymbols.has(arg)) {
            return { type: 'data', val: dataSymbols.get(arg) };
        }
        
        // Treat as Code Label or Function Import Name
        return { type: 'label', val: arg };
    };

    const op1 = parseOperand(args[0]);
    const op2 = parseOperand(args[1]);

    switch (mnemonic) {
        case 'MOV':
            // MOV Reg, Reg
            if (op1.type === 'reg' && op2.type === 'reg') {
                // REX.W + 89 /r (MOV r/m64, r64)
                // Src=Op2 (Reg), Dest=Op1 (RM)
                const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
                code.addBytes([rex, OPCODES.MOV_RM64_R64, modRM]);
            } 
            // MOV Reg, Imm
            else if (op1.type === 'reg' && op2.type === 'imm') {
                // REX.W + B8+rd imm64
                // Optimized for 32-bit imm? For now, always use 64-bit move (B8) or 32-bit sign extended (C7).
                // Let's use B8+rd (MOV r64, imm64) to be safe for pointers/large nums.
                const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const opcode = OPCODES.MOV_R64_IMM64_BASE + (op1.val & 7);
                code.addBytes([rex, opcode]);
                // Split 64-bit imm
                const v = BigInt(op2.val);
                const lo = Number(v & 0xFFFFFFFFn);
                const hi = Number((v >> 32n) & 0xFFFFFFFFn);
                code.add32(lo);
                code.add32(hi);
            }
            else {
                throw new Error("Unsupported MOV operands: " + args.join(', '));
            }
            break;

        case 'ADD':
        case 'SUB':
        case 'XOR':
            if (op1.type === 'reg' && op2.type === 'reg') {
                // Opcode selection
                let baseOp;
                if (mnemonic === 'ADD') baseOp = OPCODES.ADD_RM64_R64;
                else if (mnemonic === 'SUB') baseOp = OPCODES.SUB_RM64_R64;
                else if (mnemonic === 'XOR') baseOp = OPCODES.XOR_RM64_R64;

                const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
                code.addBytes([rex, baseOp, modRM]);
            } 
            else if (op1.type === 'reg' && op2.type === 'imm') {
                // Immediate Arithmetic. 
                // 83 /digit imm8 OR 81 /digit imm32
                // Digit mapping: ADD=0, XOR=6, SUB=5
                let digit;
                if (mnemonic === 'ADD') digit = 0;
                else if (mnemonic === 'XOR') digit = 6;
                else if (mnemonic === 'SUB') digit = 5;

                const imm = op2.val;
                // Use 8-bit if fits
                if (imm >= -128 && imm <= 127) {
                    const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                    const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
                    code.addBytes([rex, 0x83, modRM, imm & 0xFF]);
                } else {
                    const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                    const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
                    code.addBytes([rex, 0x81, modRM]);
                    code.add32(imm);
                }
            }
            break;

        case 'LEA':
            // LEA Reg, Label (Data or Code)
            if (op1.type === 'reg' && op2.type === 'data') {
                code.addLeaRegRel(op1.val, op2.val);
            } 
            else if (op1.type === 'reg' && op2.type === 'label') {
                code.addLeaLabel(op1.val, op2.val);
            } else {
                 throw new Error("LEA requires Register, Label");
            }
            break;

        case 'CALL':
            // CALL Name (Import)
            if (op1.type === 'label') {
                // For ASM imports, we expect "Name". CodeBuilder adds null terminator if needed, 
                // but our import def already put nulls.
                // We'll append \0 just to match the linker key.
                const funcName = op1.val.endsWith('\0') ? op1.val : op1.val + '\0';
                code.addCall(funcName);
            } else {
                throw new Error("CALL requires Label/Function Name");
            }
            break;

        case 'RET':
            code.addBytes([OPCODES.RET]);
            break;

        case 'PUSH':
            if (op1.type === 'reg') {
                // 50+rd. No REX.W needed for 64-bit push default? 
                // Actually 50+rd is default 64-bit in 64-bit mode.
                // If reg >= 8, we need REX.B (41).
                if (op1.val >= 8) code.addBytes([PREFIXES.REX_B]);
                code.addBytes([0x50 + (op1.val & 7)]);
            }
            break;
            
        case 'POP':
            if (op1.type === 'reg') {
                 if (op1.val >= 8) code.addBytes([PREFIXES.REX_B]);
                 code.addBytes([0x58 + (op1.val & 7)]);
            }
            break;

        default:
            throw new Error("Unknown mnemonic: " + mnemonic);
    }
}