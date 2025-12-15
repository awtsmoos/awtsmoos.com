/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { REGISTERS, REGISTER_SIZES } from '../../opcodes.js';

/**
 * Helper to parse a single operand string into a structured object.
 */
export function parseOperand(arg, dataSymbols) {
    if (!arg) return null;
    
    // Check for [Label] (Data Symbol)
    if (arg.startsWith('[') && arg.endsWith(']')) {
        const content = arg.slice(1, -1).trim();
        if (dataSymbols.has(content)) {
            return { type: 'mem', isData: true, id: dataSymbols.get(content) };
        }
    }
    
    // Memory: Support [Reg], [Reg+Disp], [Reg+Reg], [Reg+Reg+Disp]
    if (arg.startsWith('[') && arg.endsWith(']')) {
        const content = arg.slice(1, -1).trim();
        const memMatch = content.match(/^([A-Za-z]\w*)\s*(?:([+\-])\s*([A-Za-z]\w*))?\s*(?:([+\-])\s*(0x[0-9A-Fa-f]+|\d+))?$/);
        
        if (memMatch) {
            const baseName = memMatch[1].toUpperCase();
            if (REGISTERS[baseName] === undefined) throw new Error("Invalid Base Register: " + baseName);
            const base = REGISTERS[baseName];
            
            let index = null;
            if (memMatch[3]) {
                const indexName = memMatch[3].toUpperCase();
                if (REGISTERS[indexName] === undefined) throw new Error("Invalid Index Register: " + indexName);
                index = REGISTERS[indexName];
            }
            
            let disp = 0;
            if (memMatch[5]) {
                disp = parseInt(memMatch[5]);
                if (memMatch[4] === '-') disp = -disp;
            }
            
            return { type: 'mem', base, index, scale: 0, disp };
        }
    }

    // Register?
    const up = arg.toUpperCase();
    if (REGISTERS[up] !== undefined) {
        return { 
            type: 'reg', 
            val: REGISTERS[up], 
            size: REGISTER_SIZES[up] || 64 
        };
    }

    // Immediate?
    if (arg.match(/^-?0x[0-9A-Fa-f]+$/) || arg.match(/^-?\d+$/)) {
        return { type: 'imm', val: parseInt(arg) };
    }

    // Label (Data)?
    if (dataSymbols.has(arg)) {
        return { type: 'data', val: dataSymbols.get(arg) };
    }
    
    // Code Label or Import Name
    return { type: 'label', val: arg };
}