/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, makeModRM, MOD } from '../opcodes.js';
import { parseOperand } from './operands.js';

export function emitFlow(code, mnemonic, args, dataSymbols, imports) {
    if (mnemonic === 'RET') {
        code.addBytes([OPCODES.RET]);
        return;
    }
    if (mnemonic === 'CLD') {
        code.addBytes([OPCODES.CLD]);
        return;
    }
    if (mnemonic === 'STD') {
        code.addBytes([OPCODES.STD]);
        return;
    }

    const op1 = parseOperand(args[0], dataSymbols);

    if (mnemonic === 'CALL') {
        if (op1.type === 'label') {
            const name = op1.val;
            // Check imports: The parser might have stored them with \0, 
            // but the user ASM uses plain text. Check both.
            if (imports.has(name)) {
                code.addCall(name);
            } else if (imports.has(name + '\0')) {
                code.addCall(name + '\0');
            } else {
                // Local call
                code.addCallRel(name);
            }
        } else if (op1.type === 'reg') {
            // Call Reg (Indirect)
            const rex = (op1.val >= 8) ? PREFIXES.REX_B : 0;
            const modRM = makeModRM(MOD.DIRECT, 2, op1.val & 7);
            if (rex) code.addBytes([rex]);
            code.addBytes([OPCODES.CALL_RM64, modRM]);
        } else {
            throw new Error("CALL target not supported");
        }
        return;
    }

    // Jumps
    if (op1.type !== 'label') throw new Error(`${mnemonic} only supports Label`);

    // Handle Tail Calls (JMP to Import)
    if (mnemonic === 'JMP') {
        const name = op1.val;
        if (imports.has(name)) {
            code.addJmpImport(name);
            return;
        } else if (imports.has(name + '\0')) {
            code.addJmpImport(name + '\0');
            return;
        }
    }

    switch (mnemonic) {
        case 'JMP':
            code.addJumpRel32(OPCODES.JMP_REL32, op1.val);
            break;
        case 'JE':
        case 'JZ':
            code.addJumpRel32(OPCODES.JE_REL32, op1.val);
            break;
        case 'JNE':
        case 'JNZ':
            code.addJumpRel32(OPCODES.JNE_REL32, op1.val);
            break;
        case 'JL':
            code.addJumpRel32(OPCODES.JL_REL32, op1.val);
            break;
        case 'JGE':
            code.addJumpRel32(OPCODES.JGE_REL32, op1.val);
            break;
        case 'JLE':
            code.addJumpRel32(OPCODES.JLE_REL32, op1.val);
            break;
        case 'JG':
            code.addJumpRel32(OPCODES.JG_REL32, op1.val);
            break;
    }
}