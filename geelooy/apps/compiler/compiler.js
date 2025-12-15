/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { createConsoleApp } from './compiler_console.js';
import { createGuiApp } from './compiler_gui.js';
import { createCustomAsmApp } from './compiler_asm.js';
import { createCApp } from './compiler_c.js';
import { linkAndBuild } from './linker.js';

/**
 * Compiles the message into a PE32+ executable.
 * @param {string} source 
 * @param {string} mode - 'console' | 'gui' | 'asm' | 'c'
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
    } else if (mode === 'c') {
        artifact = createCApp(source);
    }
    
    // The C compiler produces ASM artifacts, which might set mode to 'gui' or 'console' inside.
    // We trust the artifact's mode if set.
    return linkAndBuild(artifact, artifact.mode || mode);
}