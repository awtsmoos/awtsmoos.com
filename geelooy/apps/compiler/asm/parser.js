/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { stringToBytes } from '../utils.js';

/**
 * Parses raw ASM source into a structured context.
 * @param {string} source 
 * @returns {Object} { tokens, importDef, dataBlobs, dataSymbols, subsystem }
 */
export function parseAsm(source) {
    const importDef = [];
    const importMap = new Map(); // DLL Name -> Object
    const dataBlobs = [];
    const dataSymbols = new Map(); // Label -> index in dataBlobs
    
    // List of operations: 
    // { type: 'label', value: 'name' } 
    // { type: 'instr', mnemonic: 'MOV', args: ['RAX', 'RBX'] }
    const tokens = []; 
    
    let subsystem = 'gui'; 

    // 1. Pre-process: Clean comments and split lines
    const lines = source.split('\n').map(l => {
        const commentIdx = l.indexOf(';');
        if (commentIdx !== -1) return l.substring(0, commentIdx).trim();
        return l.trim();
    }).filter(l => l.length > 0);

    let currentSection = 'code';

    for (let line of lines) {
        // Directive Check
        if (line.startsWith('.')) {
            const parts = line.split(/\s+/);
            const directive = parts[0].toLowerCase();
            
            if (directive === '.import') {
                // Format: .import DLL Func1 Func2 ...
                if (parts.length < 3) throw new Error("Invalid import directive: " + line);
                
                const dll = parts[1];
                const dllKey = dll.endsWith('\0') ? dll : dll + '\0';

                let def = importMap.get(dllKey);
                if (!def) {
                    def = { name: dllKey, funcs: [] };
                    importMap.set(dllKey, def);
                    importDef.push(def);
                }

                // Iterate all functions provided in the line
                for (let i = 2; i < parts.length; i++) {
                    const func = parts[i];
                    const funcKey = func.endsWith('\0') ? func : func + '\0';
                    def.funcs.push(funcKey);
                }

            } else if (directive === '.data') {
                currentSection = 'data';
            } else if (directive === '.code') {
                currentSection = 'code';
            } else if (directive === '.subsystem') {
                subsystem = parts[1].toLowerCase();
            }
            continue;
        }

        if (currentSection === 'data') {
            const match = line.match(/^(\w+):\s*"(.*)"$/);
            if (match) {
                const label = match[1];
                let content = match[2];
                // Handle basic escapes
                content = content.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                const bytes = new Uint8Array([...stringToBytes(content), 0]);
                dataSymbols.set(label, dataBlobs.length);
                dataBlobs.push(bytes);
            } else {
                throw new Error("Invalid data definition: " + line);
            }
            continue;
        }

        if (currentSection === 'code') {
            // Label Definition
            if (line.endsWith(':')) {
                const label = line.slice(0, -1);
                tokens.push({ type: 'label', value: label });
                continue;
            }

            // Instruction Parsing
            const firstSpace = line.indexOf(' ');
            if (firstSpace === -1) {
                // Instruction without operands (e.g., RET)
                tokens.push({ type: 'instr', mnemonic: line.toUpperCase(), args: [] });
            } else {
                const mnemonic = line.substring(0, firstSpace).trim().toUpperCase();
                const argsStr = line.substring(firstSpace).trim();
                // Split args by comma, respecting spaces
                const args = argsStr.split(',').map(s => s.trim());
                tokens.push({ type: 'instr', mnemonic, args });
            }
        }
    }

    return {
        tokens,
        importDef,
        dataBlobs,
        dataSymbols,
        subsystem
    };
}