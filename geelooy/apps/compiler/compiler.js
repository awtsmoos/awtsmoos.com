/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { createConsoleApp } from './compiler_console.js';
import { createGuiApp } from './compiler_gui.js';
import { linkAndBuild } from './linker.js';

/**
 * Compiles the message into a PE32+ executable.
 * @param {string} userMessage 
 * @param {string} mode - 'console' | 'gui'
 * @returns {Blob} The executable file.
 */
export function compile(userMessage, mode = 'console') {
    let artifact;
    if (mode === 'console') {
        artifact = createConsoleApp(userMessage);
    } else {
        artifact = createGuiApp(userMessage);
    }
    
    return linkAndBuild(artifact, mode);
}
