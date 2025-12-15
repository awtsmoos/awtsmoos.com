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
        
        // The parser treats "REP STOSD" as mnemonic="REP", args=["STOSD"].
        // We need to recursively dispatch the instruction in args[0].
        if (args.length > 0) {
            const nextMnemonic = args[0].toUpperCase();
            // Construct a fake token for the next instruction
            const nextToken = {
                type: 'instr',
                mnemonic: nextMnemonic,
                args: args.slice(1) // Remaining args if any
            };
            dispatchInstruction(code, nextToken, dataSymbols, imports);
        }
        return;
    }

    switch (mnemonic) {
        // --- String Instructions ---
        case 'STOSD':
            // STOSD is 32-bit by default (AB). No REX needed for 32-bit operation in 64-bit mode for this opcode usually,
            // but effectively it stores EAX.
            code.addBytes([OPCODES.STOSD]);
            break;
        case 'STOSB':
            code.addBytes([OPCODES.STOSB]);
            break;

        // --- Data Transfer ---
        case 'MOV':
        case 'LEA':
        case 'MOVSX':
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
            emitFlow(code, mnemonic, args, dataSymbols, imports);
            break;

        // --- Misc ---
        case 'NOP':
            code.addBytes([OPCODES.NOP]);
            break;

        default:
            throw new Error(`Unknown mnemonic: ${mnemonic}`);
    }
}