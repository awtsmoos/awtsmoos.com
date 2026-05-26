/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { compileC } from './c/compiler.js';
import { createCustomAsmApp } from './compiler_asm.js';

export function createCApp(source) {
    const asmSource = compileC(source);
    // Console log the generated ASM for debugging/transparency
    console.log("--- GENERATED ASM FROM C ---");
    console.log(asmSource);
    
    // Pass to ASM Compiler
    return createCustomAsmApp(asmSource);
}
