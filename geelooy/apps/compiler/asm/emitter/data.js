/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, makeModRM, MOD } from '../opcodes.js';
import { parseOperand } from './operands.js';
import { emitMemBytes } from './utils.js';

export function emitData(code, mnemonic, args, dataSymbols) {
    const op1 = parseOperand(args[0], dataSymbols);
    const op2 = parseOperand(args[1], dataSymbols);

    // Helper for RIP-Relative Data Access (MOV)
    function emitRipData(regCode, dataId) {
        const modRM = makeModRM(0b00, regCode & 7, 0b101);
        code.addBytes([modRM]);
        code.addDataPatch(dataId);
    }

    if (mnemonic === 'MOV') {
        // MOV Reg, Reg
        if (op1.type === 'reg' && op2.type === 'reg') {
            const size = op1.size || 64;
            const rexW = (size === 64) ? PREFIXES.REX_W : 0;
            const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            
            const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
            if (rex) code.addBytes([rex]);
            code.addBytes([OPCODES.MOV_RM_R, modRM]);
        } 
        // MOV Reg, Imm
        else if (op1.type === 'reg' && op2.type === 'imm') {
            const size = op1.size || 64;
            const rexW = (size === 64) ? PREFIXES.REX_W : 0;
            const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            
            const baseOp = (size === 32) ? OPCODES.MOV_R32_IMM32_BASE : OPCODES.MOV_R64_IMM64_BASE;
            
            if (rex) code.addBytes([rex]);
            code.addBytes([baseOp + (op1.val & 7)]);
            
            if (size === 64) {
                const v = BigInt(op2.val);
                code.add32(Number(v & 0xFFFFFFFFn));
                code.add32(Number((v >> 32n) & 0xFFFFFFFFn));
            } else {
                code.add32(op2.val);
            }
        }
        // MOV [Mem], Imm
        else if (op1.type === 'mem' && op2.type === 'imm') {
            if (op1.isData) throw new Error("MOV [Label], Imm not supported");
            
            const rex = PREFIXES.REX_W | (op1.base >= 8 ? PREFIXES.REX_B : 0) | ((op1.index && op1.index >= 8) ? PREFIXES.REX_X : 0);
            
            const bytes = emitMemBytes(op1, 0); 
            if (rex) code.addBytes([rex]);
            code.addBytes([0xC7, ...bytes]);
            code.add32(op2.val);
        }
        // MOV [Mem], Reg
        else if (op1.type === 'mem' && op2.type === 'reg') {
             const size = op2.size || 64;
             const rexW = (size === 64) ? PREFIXES.REX_W : 0;
             const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.base >= 8 ? PREFIXES.REX_B : 0) | ((op1.index && op1.index >= 8) ? PREFIXES.REX_X : 0);
             
             if (op1.isData) {
                 if (rex) code.addBytes([rex]);
                 code.addBytes([OPCODES.MOV_RM_R]); 
                 emitRipData(op2.val, op1.id);
             } else {
                 const bytes = emitMemBytes(op1, op2.val);
                 if (rex) code.addBytes([rex]);
                 code.addBytes([OPCODES.MOV_RM_R, ...bytes]);
             }
        }
        // MOV Reg, [Mem]
        else if (op1.type === 'reg' && op2.type === 'mem') {
             const size = op1.size || 64;
             const rexW = (size === 64) ? PREFIXES.REX_W : 0;
             const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_R : 0);
             
             if (op2.isData) {
                 if (rex) code.addBytes([rex]);
                 code.addBytes([OPCODES.MOV_R_RM]); 
                 emitRipData(op1.val, op2.id);
             } else {
                 const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
                 if (rex | extraRex) code.addBytes([rex | extraRex]);
                 const bytes = emitMemBytes(op2, op1.val);
                 code.addBytes([OPCODES.MOV_R_RM, ...bytes]);
             }
        }
    } 
    else if (mnemonic.startsWith('CMOV')) {
        // CMOVcc DestReg, SourceReg/Mem
        if (op1.type !== 'reg') throw new Error(`${mnemonic} destination must be a register`);
        
        let suffix = mnemonic.substring(4); // L, G, E, NZ, etc
        if (suffix === 'Z') suffix = 'E';
        if (suffix === 'NZ') suffix = 'NE';
        
        const opcodeArr = OPCODES[`CMOV_${suffix}`];
        if (!opcodeArr) throw new Error(`Unknown Conditional Move: ${mnemonic}`);
        
        const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0);
        
        if (op2.type === 'reg') {
            const finalRex = rex | (op2.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
            if (finalRex) code.addBytes([finalRex]);
            code.addBytes([opcodeArr[0], opcodeArr[1], modRM]);
        } 
        else if (op2.type === 'mem') {
            const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
            const finalRex = rex | extraRex;
            if (finalRex) code.addBytes([finalRex]);
            code.addBytes([opcodeArr[0], opcodeArr[1]]);
            const bytes = emitMemBytes(op2, op1.val);
            code.addBytes(bytes);
        } else {
            throw new Error(`${mnemonic} supports Reg, Reg/Mem only`);
        }
    }
    else if (mnemonic === 'MOVSX') {
        if (op1.type === 'reg' && op2.type === 'reg') {
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.val >= 8 ? PREFIXES.REX_B : 0);
             const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
             code.addBytes([rex, OPCODES.MOVSX_R64_RM8[0], OPCODES.MOVSX_R64_RM8[1], modRM]);
        } 
        else if (op1.type === 'reg' && op2.type === 'mem') {
             // MOVSX Reg, Mem (Byte)
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
             const bytes = emitMemBytes(op2, op1.val);
             code.addBytes([rex, OPCODES.MOVSX_R64_RM8[0], OPCODES.MOVSX_R64_RM8[1], ...bytes]);
        }
    }
    else if (mnemonic === 'LEA') {
        if (op1.type === 'reg' && op2.type === 'label') {
            code.addLeaLabel(op1.val, op2.val);
        } else if (op1.type === 'reg' && op2.type === 'data') {
            code.addLeaRegRel(op1.val, op2.val);
        } else if (op1.type === 'reg' && op2.type === 'mem') {
             const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
             const bytes = emitMemBytes(op2, op1.val);
             code.addBytes([rex, OPCODES.LEA_R64_M, ...bytes]);
        }
    }
}