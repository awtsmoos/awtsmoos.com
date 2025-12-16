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
        const size = op1.size || 64; // Default to 64 if not specified

        // 1. MOV Reg, Reg
        if (op1.type === 'reg' && op2.type === 'reg') {
            const rexW = (size === 64) ? PREFIXES.REX_W : 0;
            const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
            
            if (size === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
            if (rex) code.addBytes([rex]);
            
            const opcode = (size === 8) ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
            code.addBytes([opcode, modRM]);
        } 
        
        // 2. MOV Reg, Imm
        else if (op1.type === 'reg' && op2.type === 'imm') {
            const rexW = (size === 64) ? PREFIXES.REX_W : 0;
            const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_B : 0);
            
            if (size === 8) {
                if (rex) code.addBytes([rex]);
                code.addBytes([OPCODES.MOV_R8_IMM8_BASE + (op1.val & 7)]);
                code.addBytes([op2.val & 0xFF]);
            } else if (size === 16) {
                code.addBytes([PREFIXES.OS_OVERRIDE]);
                if (rex) code.addBytes([rex]);
                code.addBytes([OPCODES.MOV_R32_IMM32_BASE + (op1.val & 7)]);
                code.addBytes([op2.val & 0xFF, (op2.val >> 8) & 0xFF]);
            } else if (size === 32) {
                if (rex) code.addBytes([rex]); // Usually not needed for R32, clears high 32
                code.addBytes([OPCODES.MOV_R32_IMM32_BASE + (op1.val & 7)]);
                code.add32(op2.val);
            } else { // 64
                if (rex) code.addBytes([rex]);
                code.addBytes([OPCODES.MOV_R64_IMM64_BASE + (op1.val & 7)]);
                const v = BigInt(op2.val);
                code.add32(Number(v & 0xFFFFFFFFn));
                code.add32(Number((v >> 32n) & 0xFFFFFFFFn));
            }
        }
        
        // 3. MOV [Mem], Imm
        else if (op1.type === 'mem' && op2.type === 'imm') {
            if (op1.isData) throw new Error("MOV [Label], Imm not supported directly. Use register.");
            
            const rexW = (size === 64) ? PREFIXES.REX_W : 0;
            const rex = rexW | (op1.base >= 8 ? PREFIXES.REX_B : 0) | ((op1.index && op1.index >= 8) ? PREFIXES.REX_X : 0);
            
            if (size === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
            if (rex) code.addBytes([rex]);

            if (size === 8) {
                code.addBytes([OPCODES.MOV_RM8_IMM8]);
                const bytes = emitMemBytes(op1, 0); 
                code.addBytes(bytes);
                code.addBytes([op2.val & 0xFF]);
            } else if (size === 16) {
                code.addBytes([OPCODES.MOV_RM_IMM32]);
                const bytes = emitMemBytes(op1, 0); 
                code.addBytes(bytes);
                code.addBytes([op2.val & 0xFF, (op2.val >> 8) & 0xFF]);
            } else if (size === 32) {
                code.addBytes([OPCODES.MOV_RM_IMM32]);
                const bytes = emitMemBytes(op1, 0); 
                code.addBytes(bytes);
                code.add32(op2.val);
            } else { // 64
                code.addBytes([OPCODES.MOV_RM_IMM32]); // Sign-extended 32-bit imm to 64-bit mem
                const bytes = emitMemBytes(op1, 0); 
                code.addBytes(bytes);
                code.add32(op2.val); // Limitation: Can only write 32-bit immediate to 64-bit mem
            }
        }
        
        // 4. MOV [Mem], Reg
        else if (op1.type === 'mem' && op2.type === 'reg') {
             // Size comes from Register size unless overridden, check conflict?
             const regSize = op2.size || 64;
             const opSize = size || regSize; 
             
             const rexW = (opSize === 64) ? PREFIXES.REX_W : 0;
             const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.base >= 8 ? PREFIXES.REX_B : 0) | ((op1.index && op1.index >= 8) ? PREFIXES.REX_X : 0);
             
             if (opSize === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
             if (op1.isData) {
                 if (rex) code.addBytes([rex]);
                 const opcode = (opSize === 8) ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
                 code.addBytes([opcode]); 
                 emitRipData(op2.val, op1.id);
             } else {
                 const bytes = emitMemBytes(op1, op2.val);
                 if (rex) code.addBytes([rex]);
                 const opcode = (opSize === 8) ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
                 code.addBytes([opcode, ...bytes]);
             }
        }
        
        // 5. MOV Reg, [Mem]
        else if (op1.type === 'reg' && op2.type === 'mem') {
             const opSize = op1.size; // Destination determines size
             const rexW = (opSize === 64) ? PREFIXES.REX_W : 0;
             const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_R : 0);
             
             if (opSize === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);

             if (op2.isData) {
                 if (rex) code.addBytes([rex]);
                 const opcode = (opSize === 8) ? OPCODES.MOV_R8_RM8 : OPCODES.MOV_R_RM;
                 code.addBytes([opcode]); 
                 emitRipData(op1.val, op2.id);
             } else {
                 const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
                 if (rex | extraRex) code.addBytes([rex | extraRex]);
                 
                 const opcode = (opSize === 8) ? OPCODES.MOV_R8_RM8 : OPCODES.MOV_R_RM;
                 const bytes = emitMemBytes(op2, op1.val);
                 code.addBytes([opcode, ...bytes]);
             }
        }
    } 
    else if (mnemonic === 'MOVZX') {
        // MOVZX Reg, R/M (Byte to ... )
        if (op1.type === 'reg' && (op2.type === 'reg' || op2.type === 'mem')) {
             const rexW = (op1.size === 64) ? PREFIXES.REX_W : 0;
             const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_R : 0);
             
             // Base is byte, dest is word/dword/qword
             // Currently only supporting byte source
             
             if (op2.type === 'reg') {
                 const finalRex = rex | (op2.val >= 8 ? PREFIXES.REX_B : 0);
                 if (finalRex) code.addBytes([finalRex]);
                 const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
                 code.addBytes([OPCODES.MOVZX_R_RM[0], OPCODES.MOVZX_R_RM[1], modRM]);
             } else {
                 const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | ((op2.index && op2.index >= 8) ? PREFIXES.REX_X : 0);
                 if (rex | extraRex) code.addBytes([rex | extraRex]);
                 code.addBytes([OPCODES.MOVZX_R_RM[0], OPCODES.MOVZX_R_RM[1]]);
                 const bytes = emitMemBytes(op2, op1.val);
                 code.addBytes(bytes);
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