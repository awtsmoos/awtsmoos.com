/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, REGISTERS, makeModRM, MOD } from '../opcodes.js';
import { CodeBuilder } from '../assembler.js';

/**
 * Emits machine code for the parsed ASM context.
 * @param {Object} ctx - The parsed context from parser.js
 * @returns {CodeBuilder} The populated CodeBuilder
 */
export function emitAsm(ctx) {
    const code = new CodeBuilder();
    const { tokens, dataSymbols, importDef } = ctx;

    // Create a Set of import names for fast lookup
    const imports = new Set();
    if (importDef) {
        importDef.forEach(dll => {
            dll.funcs.forEach(f => imports.add(f));
        });
    }

    for (const token of tokens) {
        if (token.type === 'label') {
            code.markLabel(token.value);
        } else if (token.type === 'instr') {
            emitInstruction(code, token.mnemonic, token.args, dataSymbols, imports);
        }
    }

    return code;
}

/**
 * Helper to parse a single operand string into a structured object.
 */
function parseOperand(arg, dataSymbols) {
    if (!arg) return null;
    
    // Memory: [Reg + Disp] or [Reg]
    const memMatch = arg.match(/^\[(\w+)\s*([+\-])?\s*(0x[0-9a-f]+|\d+)?\]$/i);
    if (memMatch) {
        const regName = memMatch[1].toUpperCase();
        const sign = memMatch[2] || '+';
        const offsetStr = memMatch[3] || '0';
        
        if (REGISTERS[regName] === undefined) throw new Error("Invalid Register in Memory Operand: " + regName);
        
        let disp = parseInt(offsetStr);
        if (sign === '-') disp = -disp;
        
        return { type: 'mem', reg: REGISTERS[regName], disp: disp };
    }

    // Register?
    const up = arg.toUpperCase();
    if (REGISTERS[up] !== undefined) {
        return { type: 'reg', val: REGISTERS[up] };
    }

    // Immediate?
    if (arg.match(/^-?0x[0-9A-Fa-f]+$/) || arg.match(/^-?\d+$/)) {
        return { type: 'imm', val: parseInt(arg) };
    }

    // Label (Data)?
    if (dataSymbols.has(arg)) {
        return { type: 'data', val: dataSymbols.get(arg) };
    }
    
    // Code Label or Import Name
    return { type: 'label', val: arg };
}

function emitInstruction(code, mnemonic, args, dataSymbols, imports) {
    const op1 = parseOperand(args[0], dataSymbols);
    const op2 = parseOperand(args[1], dataSymbols);

    switch (mnemonic) {
        case 'MOV':
            if (op1.type === 'reg' && op2.type === 'reg') {
                const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
                code.addBytes([rex, OPCODES.MOV_RM64_R64, modRM]);
            } 
            else if (op1.type === 'reg' && op2.type === 'imm') {
                const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const opcode = OPCODES.MOV_R64_IMM64_BASE + (op1.val & 7);
                code.addBytes([rex, opcode]);
                const v = BigInt(op2.val);
                code.add32(Number(v & 0xFFFFFFFFn));
                code.add32(Number((v >> 32n) & 0xFFFFFFFFn));
            }
            else if (op1.type === 'mem' && op2.type === 'imm') {
                const rex = PREFIXES.REX_W | (op1.reg >= 8 ? PREFIXES.REX_B : 0);
                let mod = MOD.DISP32;
                if (op1.disp >= -128 && op1.disp <= 127) mod = MOD.DISP8;
                if (op1.disp === 0) mod = MOD.INDIRECT; 
                if (op1.disp !== 0) mod = MOD.DISP32; 

                const modRM = makeModRM(mod, 0, op1.reg & 7);
                if ((op1.reg & 7) === 4) { 
                    code.addBytes([rex, 0xC7, modRM, 0x24]); 
                } else {
                    code.addBytes([rex, 0xC7, modRM]);
                }

                if (mod === MOD.DISP32) code.add32(op1.disp);
                else if (mod === MOD.DISP8) code.addBytes([op1.disp & 0xFF]);
                code.add32(op2.val);
            }
            else if (op1.type === 'mem' && op2.type === 'reg') {
                 const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.reg >= 8 ? PREFIXES.REX_B : 0);
                 const mod = (op1.disp !== 0) ? MOD.DISP32 : MOD.INDIRECT; 
                 const modRM = makeModRM(mod, op2.val & 7, op1.reg & 7);
                 if ((op1.reg & 7) === 4) { 
                     code.addBytes([rex, 0x89, modRM, 0x24]);
                 } else {
                     code.addBytes([rex, 0x89, modRM]);
                 }
                 if (mod === MOD.DISP32) code.add32(op1.disp);
            }
            else {
                throw new Error(`Unsupported MOV: ${JSON.stringify(op1)} <- ${JSON.stringify(op2)}`);
            }
            break;

        case 'ADD':
        case 'SUB':
        case 'XOR':
        case 'CMP':
            let baseOp, digit;
            if (mnemonic === 'ADD') { baseOp = OPCODES.ADD_RM64_R64; digit = 0; }
            if (mnemonic === 'SUB') { baseOp = OPCODES.SUB_RM64_R64; digit = 5; }
            if (mnemonic === 'XOR') { baseOp = OPCODES.XOR_RM64_R64; digit = 6; }
            if (mnemonic === 'CMP') { baseOp = OPCODES.CMP_RM64_R64; digit = 7; }

            if (op1.type === 'reg' && op2.type === 'reg') {
                const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
                code.addBytes([rex, baseOp, modRM]);
            } 
            else if (op1.type === 'reg' && op2.type === 'imm') {
                const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
                if (op2.val >= -128 && op2.val <= 127) {
                    code.addBytes([rex, 0x83, modRM, op2.val & 0xFF]);
                } else {
                    code.addBytes([rex, 0x81, modRM]);
                    code.add32(op2.val);
                }
            } else {
                 throw new Error(`${mnemonic} only supports Reg, Reg/Imm`);
            }
            break;
        
        case 'INC':
        case 'DEC':
            // REX.W + FF /0 (INC) or /1 (DEC)
            let extDigit = (mnemonic === 'INC') ? 0 : 1;
            if (op1.type === 'reg') {
                 const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
                 const modRM = makeModRM(MOD.DIRECT, extDigit, op1.val & 7);
                 code.addBytes([rex, 0xFF, modRM]);
            } else {
                throw new Error(`${mnemonic} only supports Reg`);
            }
            break;

        case 'PUSH':
            if (op1.type === 'reg') {
                // 50 + rd. No REX.W needed for 64-bit push default, but REX.B if extended.
                if (op1.val >= 8) {
                    code.addBytes([PREFIXES.REX_B, OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
                } else {
                    code.addBytes([OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
                }
            } else {
                throw new Error("PUSH only supports Reg");
            }
            break;

        case 'POP':
            if (op1.type === 'reg') {
                // 58 + rd
                if (op1.val >= 8) {
                    code.addBytes([PREFIXES.REX_B, OPCODES.POP_R64_BASE + (op1.val & 7)]);
                } else {
                    code.addBytes([OPCODES.POP_R64_BASE + (op1.val & 7)]);
                }
            } else {
                throw new Error("POP only supports Reg");
            }
            break;

        case 'LEA':
            if (op1.type === 'reg' && op2.type === 'label') {
                // LEA Reg, [Label] (RIP Relative)
                // Case 1: Import? (Assuming function pointer logic if needed, but imports are usually called directly)
                // Case 2: Code Label?
                code.addLeaLabel(op1.val, op2.val);
            } else if (op1.type === 'reg' && op2.type === 'data') {
                // LEA Reg, [Data]
                code.addLeaRegRel(op1.val, op2.val);
            } else if (op1.type === 'reg' && op2.type === 'mem') {
                 // Standard LEA: LEA Reg, [Base+Disp]
                 const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.reg >= 8 ? PREFIXES.REX_B : 0);
                 const mod = (op2.disp !== 0) ? MOD.DISP32 : MOD.INDIRECT;
                 const modRM = makeModRM(mod, op1.val & 7, op2.reg & 7);
                 code.addBytes([rex, OPCODES.LEA_R64_M, modRM]);
                 if (mod === MOD.DISP32) code.add32(op2.disp);
            }
            else {
                throw new Error("Invalid LEA usage");
            }
            break;

        case 'CALL':
            if (op1.type === 'label') {
                if (imports.has(op1.val)) {
                    code.addCall(op1.val);
                } else {
                    // Local call
                    code.addCallRel(op1.val);
                }
            } else if (op1.type === 'reg') {
                // Call Reg (Indirect): FF /2
                const rex = (op1.val >= 8) ? PREFIXES.REX_B : 0; // No REX.W needed for near call? spec says yes/no depending.
                // Actually 64-bit indirect call usually doesn't strictly need REX.W unless size override. 
                // But let's check spec. "FF /2" -> CALL r/m64. REX.W Promotes to 64-bit operand size? 
                // In 64-bit mode, operand size defaults to 64-bit for near calls.
                const modRM = makeModRM(MOD.DIRECT, 2, op1.val & 7);
                if (rex) code.addBytes([rex]);
                code.addBytes([OPCODES.CALL_RM64, modRM]);
            } else {
                throw new Error("CALL target not supported");
            }
            break;

        case 'RET':
            code.addBytes([OPCODES.RET]);
            break;

        case 'JMP':
            if (op1.type === 'label') {
                code.addJumpRel32(OPCODES.JMP_REL32, op1.val);
            } else {
                throw new Error("JMP only supports Label");
            }
            break;

        case 'JE':
        case 'JZ':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JE_REL32, op1.val);
            break;

        case 'JNE':
        case 'JNZ':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JNE_REL32, op1.val);
            break;
            
        case 'JL':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JL_REL32, op1.val);
            break;

        case 'JGE':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JGE_REL32, op1.val);
            break;

        case 'JLE':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JLE_REL32, op1.val);
            break;
            
        case 'JG':
            if (op1.type === 'label') code.addJumpRel32(OPCODES.JG_REL32, op1.val);
            break;

        case 'NOP':
            code.addBytes([OPCODES.NOP]);
            break;

        default:
            throw new Error(`Unknown mnemonic: ${mnemonic}`);
    }
}