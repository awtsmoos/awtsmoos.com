/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, makeModRM, MOD } from '../opcodes.js';
import { parseOperand } from './operands.js';
import { emitMemBytes } from './utils.js';

export function emitMath(code, mnemonic, args, dataSymbols) {
    const op1 = parseOperand(args[0], dataSymbols);
    const op2 = parseOperand(args[1], dataSymbols);

    // --- SETcc ---
    if (mnemonic.startsWith('SET')) {
        if (op1.type === 'reg') {
            let rex = 0;
            if (op1.val >= 4 && op1.val <= 7 && op1.size === 8) {
                rex = PREFIXES.REX; 
            }
            if (op1.val >= 8) {
                rex = PREFIXES.REX_B; 
            }
            const modRM = makeModRM(MOD.DIRECT, 0, op1.val & 7);
            if (rex) code.addBytes([rex]);
            
            let opcodeArr;
            switch(mnemonic) {
                case 'SETE': opcodeArr = OPCODES.SETE_RM8; break;
                case 'SETNE': opcodeArr = OPCODES.SETNE_RM8; break;
                case 'SETL': opcodeArr = OPCODES.SETL_RM8; break;
                case 'SETG': opcodeArr = OPCODES.SETG_RM8; break;
                case 'SETLE': opcodeArr = OPCODES.SETLE_RM8; break;
                case 'SETGE': opcodeArr = OPCODES.SETGE_RM8; break;
                default: throw new Error("Unknown SETcc mnemonic: " + mnemonic);
            }

            code.addBytes([opcodeArr[0], opcodeArr[1], modRM]);
            return;
        } else {
            throw new Error(`${mnemonic} only supports Reg8`);
        }
    }

    // --- Shifts (SAR, SHL) ---
    if (mnemonic === 'SAR' || mnemonic === 'SHL') {
        const digit = (mnemonic === 'SAR') ? 7 : 4;
        if (op1.type === 'reg' && op2.type === 'imm') {
            const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
            code.addBytes([rex, 0xC1, modRM, op2.val & 0xFF]);
        } else {
            throw new Error(`${mnemonic} only supports Reg, Imm`);
        }
        return;
    }

    // --- IDIV / DIV ---
    if (mnemonic === 'IDIV' || mnemonic === 'DIV') {
        const digit = (mnemonic === 'IDIV') ? 7 : 6;
        if (op1.type === 'reg') {
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
             const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
             code.addBytes([rex, 0xF7, modRM]);
        } else {
            throw new Error(`${mnemonic} only supports Reg`);
        }
        return;
    }

    // --- IMUL ---
    if (mnemonic === 'IMUL') {
        // IMUL Reg, Reg
        if (op1.type === 'reg' && op2.type === 'reg') {
            const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
            code.addBytes([rex, OPCODES.IMUL_R64_RM64[0], OPCODES.IMUL_R64_RM64[1], modRM]);
        }
        // IMUL Reg, Imm (e.g. IMUL RAX, 100) -> 69 /r imm32
        else if (op1.type === 'reg' && op2.type === 'imm') {
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
             // Dest = Src (IMUL Reg, Reg, Imm)
             const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op1.val & 7); 
             
             // Check if imm8 fits (6B)
             if (op2.val >= -128 && op2.val <= 127) {
                 code.addBytes([rex, 0x6B, modRM, op2.val & 0xFF]);
             } else {
                 code.addBytes([rex, 0x69, modRM]);
                 code.add32(op2.val);
             }
        }
        // IMUL Reg, Mem
        else if (op1.type === 'reg' && op2.type === 'mem') {
            const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
            const bytes = emitMemBytes(op2, op1.val);
            code.addBytes([rex, OPCODES.IMUL_R64_RM64[0], OPCODES.IMUL_R64_RM64[1], ...bytes]);
        }
        else {
            throw new Error("IMUL unsupported operands");
        }
        return;
    }

    // --- INC / DEC / NEG ---
    if (mnemonic === 'INC' || mnemonic === 'DEC' || mnemonic === 'NEG') {
        let extDigit;
        if (mnemonic === 'INC') extDigit = 0;
        else if (mnemonic === 'DEC') extDigit = 1;
        else if (mnemonic === 'NEG') extDigit = 3;

        if (op1.type === 'reg') {
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
             const modRM = makeModRM(MOD.DIRECT, extDigit, op1.val & 7);
             const opcode = (mnemonic === 'NEG') ? OPCODES.NEG_RM64 : 0xFF; // INC/DEC use FF
             code.addBytes([rex, opcode, modRM]);
        } else {
            throw new Error(`${mnemonic} only supports Reg`);
        }
        return;
    }
    
    // --- TEST ---
    if (mnemonic === 'TEST') {
        // TEST Reg, Reg (85 /r)
        if (op1.type === 'reg' && op2.type === 'reg') {
            const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
            if (rex) code.addBytes([rex]);
            code.addBytes([OPCODES.TEST_RM64_R64, modRM]);
        }
        // TEST Reg, Imm (F7 /0)
        else if (op1.type === 'reg' && op2.type === 'imm') {
            const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, 0, op1.val & 7);
            if (rex) code.addBytes([rex]);
            code.addBytes([OPCODES.TEST_RM64_IMM32, modRM]);
            code.add32(op2.val);
        }
        else {
            throw new Error("TEST only supports Reg, Reg or Reg, Imm");
        }
        return;
    }

    // --- ADD, SUB, XOR, OR, AND, CMP ---
    let baseOpRM_R, baseOpR_RM, digit;
    
    if (mnemonic === 'ADD') { baseOpRM_R = OPCODES.ADD_RM64_R64; baseOpR_RM = OPCODES.ADD_R64_RM64; digit = 0; }
    if (mnemonic === 'SUB') { baseOpRM_R = OPCODES.SUB_RM64_R64; baseOpR_RM = OPCODES.SUB_R64_RM64; digit = 5; }
    if (mnemonic === 'XOR') { baseOpRM_R = OPCODES.XOR_RM64_R64; baseOpR_RM = OPCODES.XOR_R64_RM64; digit = 6; }
    if (mnemonic === 'OR')  { baseOpRM_R = OPCODES.OR_RM64_R64;  baseOpR_RM = OPCODES.OR_R64_RM64;  digit = 1; }
    if (mnemonic === 'AND') { baseOpRM_R = OPCODES.AND_RM64_R64; baseOpR_RM = OPCODES.AND_R64_RM64; digit = 4; }
    if (mnemonic === 'CMP') { baseOpRM_R = OPCODES.CMP_RM64_R64; baseOpR_RM = OPCODES.CMP_R64_RM64; digit = 7; }

    // 1. Reg, Reg
    if (op1.type === 'reg' && op2.type === 'reg') {
        const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
        // Uses RM_R form: DST=RM(op1), SRC=Reg(op2)
        const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
        code.addBytes([rex, baseOpRM_R, modRM]);
    } 
    // 2. Reg, Imm
    else if (op1.type === 'reg' && op2.type === 'imm') {
        const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
        const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
        if (op2.val >= -128 && op2.val <= 127) {
            code.addBytes([rex, 0x83, modRM, op2.val & 0xFF]);
        } else {
            code.addBytes([rex, 0x81, modRM]);
            code.add32(op2.val);
        }
    } 
    // 3. Reg, Mem (DST=Reg, SRC=Mem) -> Use R_RM opcode
    else if (op1.type === 'reg' && op2.type === 'mem') {
         const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
         const bytes = emitMemBytes(op2, op1.val); // op1 is reg index
         if (rex) code.addBytes([rex]);
         code.addBytes([baseOpR_RM, ...bytes]);
    }
    // 4. Mem, Reg (DST=Mem, SRC=Reg) -> Use RM_R opcode
    else if (op1.type === 'mem' && op2.type === 'reg') {
         const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.base >= 8 ? PREFIXES.REX_B : 0) | ((op1.index && op1.index >= 8) ? PREFIXES.REX_X : 0);
         const bytes = emitMemBytes(op1, op2.val); // op2 is reg index
         if (rex) code.addBytes([rex]);
         code.addBytes([baseOpRM_R, ...bytes]);
    }
    else {
         throw new Error(`${mnemonic} unsupported operands: ${op1.type}, ${op2.type}`);
    }
}