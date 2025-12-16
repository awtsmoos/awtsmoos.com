/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { CodeBuilder } from '../assembler.js';
import { OPCODES, PREFIXES } from '../opcodes.js';
import { emitData } from './data.js';
import { emitMath } from './math.js';
import { emitStack } from './stack.js';
import { emitFlow } from './flow.js';

export function emitAsm(ctx) {
    const code = new CodeBuilder();
    const { tokens, dataSymbols, importDef } = ctx;

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
            dispatchInstruction(code, token, dataSymbols, imports);
        }
    }

    return code;
}

function dispatchInstruction(code, token, dataSymbols, imports) {
    const { mnemonic, args } = token;
    
    // Prefix Handling: REP
    if (mnemonic === 'REP') {
        code.addBytes([PREFIXES.REP]);
        if (args.length > 0) {
            const nextMnemonic = args[0].toUpperCase();
            const nextToken = {
                type: 'instr',
                mnemonic: nextMnemonic,
                args: args.slice(1) 
            };
            dispatchInstruction(code, nextToken, dataSymbols, imports);
        }
        return;
    }

    switch (mnemonic) {
        // --- String Instructions ---
        case 'STOSD':
            code.addBytes([OPCODES.STOSD]);
            break;
        case 'STOSB':
            code.addBytes([OPCODES.STOSB]);
            break;
        case 'MOVSB':
            code.addBytes([OPCODES.MOVSB]);
            break;
        case 'MOVSD':
            code.addBytes([OPCODES.MOVSD]);
            break;

        // --- Data Transfer ---
        case 'MOV':
        case 'LEA':
        case 'MOVSX':
        case 'MOVZX':
        // CMOVcc
        case 'CMOVO': case 'CMOVNO': case 'CMOVB': case 'CMOVAE':
        case 'CMOVE': case 'CMOVNE': case 'CMOVBE': case 'CMOVA':
        case 'CMOVS': case 'CMOVNS': case 'CMOVP': case 'CMOVNP':
        case 'CMOVL': case 'CMOVGE': case 'CMOVLE': case 'CMOVG':
        case 'CMOVZ': case 'CMOVNZ': 
            emitData(code, mnemonic, args, dataSymbols);
            break;

        // --- Arithmetic & Logic ---
        case 'ADD':
        case 'SUB':
        case 'XOR':
        case 'OR':
        case 'AND':
        case 'CMP':
        case 'TEST':
        case 'INC':
        case 'DEC':
        case 'NEG':
        case 'IMUL':
        case 'IDIV':
        case 'DIV':
        case 'SAR':
        case 'SHL':
        case 'SETE':
        case 'SETNE':
        case 'SETG':
        case 'SETL':
        case 'SETGE':
        case 'SETLE':
            emitMath(code, mnemonic, args, dataSymbols);
            break;

        case 'CQO':
            code.addBytes([PREFIXES.REX_W, OPCODES.CQO]);
            break;

        // --- Stack ---
        case 'PUSH':
        case 'POP':
            emitStack(code, mnemonic, args, dataSymbols);
            break;

        // --- Control Flow ---
        case 'CALL':
        case 'RET':
        case 'JMP':
        case 'JE':  case 'JZ':
        case 'JNE': case 'JNZ':
        case 'JL':
        case 'JGE':
        case 'JLE':
        case 'JG':
        case 'CLD':
        case 'STD':
            emitFlow(code, mnemonic, args, dataSymbols, imports);
            break;

        // --- Misc ---
        case 'NOP':
            code.addBytes([OPCODES.NOP]);
            break;
        case 'INT3':
            code.addBytes([OPCODES.INT3]);
            break;

        default:
            throw new Error(`Unknown mnemonic: ${mnemonic}`);
    }
}