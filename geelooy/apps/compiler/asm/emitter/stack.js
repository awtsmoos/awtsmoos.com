/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES } from '../opcodes.js';
import { parseOperand } from './operands.js';

export function emitStack(code, mnemonic, args, dataSymbols) {
    const op1 = parseOperand(args[0], dataSymbols);

    if (mnemonic === 'PUSH') {
        if (op1.type === 'reg') {
            // 50 + rd
            if (op1.val >= 8) {
                code.addBytes([PREFIXES.REX_B, OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
            } else {
                code.addBytes([OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
            }
        } else {
            throw new Error("PUSH only supports Reg");
        }
    } 
    else if (mnemonic === 'POP') {
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
    }
}