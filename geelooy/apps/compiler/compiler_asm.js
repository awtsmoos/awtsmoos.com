/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { parseAsm } from './asm/parser.js';
import { emitAsm } from './asm/emitter.js';

/**
 * Parses ASM text and generates an artifact.
 * @param {string} source 
 */
export function createCustomAsmApp(source) {
    // 1. Parse the source into structure
    const context = parseAsm(source);

    // 2. Emit Machine Code
    const code = emitAsm(context);

    // 3. Return Artifact
    return {
        code,
        dataBlobs: context.dataBlobs,
        importDef: context.importDef,
        mode: context.subsystem
    };
}