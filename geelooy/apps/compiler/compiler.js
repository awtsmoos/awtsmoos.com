/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { createConsoleApp } from './compiler_console.js';
import { createGuiApp } from './compiler_gui.js';
import { createCustomAsmApp } from './compiler_asm.js';
import { linkAndBuild } from './linker.js';

/**
 * Compiles the message into a PE32+ executable.
 * @param {string} source 
 * @param {string} mode - 'console' | 'gui' | 'asm'
 * @returns {Blob} The executable file.
 */
export function compile(source, mode = 'console') {
    let artifact;
    if (mode === 'console') {
        artifact = createConsoleApp(source);
    } else if (mode === 'gui') {
        artifact = createGuiApp(source);
    } else if (mode === 'asm') {
        artifact = createCustomAsmApp(source);
    }
    
    return linkAndBuild(artifact, mode);
}