/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { REGISTERS, REGISTER_SIZES } from '../opcodes.js';

/**
 * Helper to parse a single operand string into a structured object.
 */
export function parseOperand(arg, dataSymbols) {
    if (!arg) return null;
    
    let raw = arg;
    let sizeOverride = null;

    // Detect Size Directive
    if (raw.startsWith('BYTE PTR ')) { sizeOverride = 8; raw = raw.substring(9).trim(); }
    else if (raw.startsWith('WORD PTR ')) { sizeOverride = 16; raw = raw.substring(9).trim(); }
    else if (raw.startsWith('DWORD PTR ')) { sizeOverride = 32; raw = raw.substring(10).trim(); }
    else if (raw.startsWith('QWORD PTR ')) { sizeOverride = 64; raw = raw.substring(10).trim(); }

    // Check for [Label] (Data Symbol)
    if (raw.startsWith('[') && raw.endsWith(']')) {
        const content = raw.slice(1, -1).trim();
        if (dataSymbols.has(content)) {
            return { type: 'mem', isData: true, id: dataSymbols.get(content), size: sizeOverride || 64 };
        }
    }
    
    // Memory: Support [Reg], [Reg+Disp], [Reg+Reg], [Reg+Reg+Disp],
    // and scaled index [Reg+Reg*scale+Disp] (scale in {1,2,4,8}).
    if (raw.startsWith('[') && raw.endsWith(']')) {
        const content = raw.slice(1, -1).trim();
        const memMatch = content.match(/^([A-Za-z]\w*)\s*(?:([+\-])\s*([A-Za-z]\w*)(?:\*([1248]))?)?\s*(?:([+\-])\s*(0x[0-9A-Fa-f]+|\d+))?$/);
        
        if (memMatch) {
            const baseName = memMatch[1].toUpperCase();
            if (REGISTERS[baseName] === undefined) throw new Error("Invalid Base Register: " + baseName);
            const base = REGISTERS[baseName];
            
            let index = null;
            let scale = 0; // SIB encoding: 0,1,2,3 -> x1,x2,x4,x8
            if (memMatch[3]) {
                const indexName = memMatch[3].toUpperCase();
                if (REGISTERS[indexName] === undefined) throw new Error("Invalid Index Register: " + indexName);
                index = REGISTERS[indexName];
                const sc = memMatch[4] ? parseInt(memMatch[4]) : 1;
                scale = sc === 1 ? 0 : sc === 2 ? 1 : sc === 4 ? 2 : 3;
            }
            
            let disp = 0;
            if (memMatch[6]) {
                disp = parseInt(memMatch[6]);
                if (memMatch[5] === '-') disp = -disp;
            }
            
            return { type: 'mem', base, index, scale, disp, size: sizeOverride || 64 };
        }
    }

    // Register?
    const up = raw.toUpperCase();
    if (REGISTERS[up] !== undefined) {
        return { 
            type: 'reg', 
            val: REGISTERS[up], 
            size: REGISTER_SIZES[up] || 64 
        };
    }

    // Immediate?
    if (raw.match(/^-?0x[0-9A-Fa-f]+$/) || raw.match(/^-?\d+$/)) {
        // B"H: full 64-bit immediates. parseInt loses precision past 2^53;
        // keep a BigInt when the literal exceeds the safe-integer range.
        let val;
        try {
            const bi = BigInt(raw);
            val = (bi >= BigInt(Number.MIN_SAFE_INTEGER) && bi <= BigInt(Number.MAX_SAFE_INTEGER))
                ? Number(bi) : bi;
        } catch {
            val = parseInt(raw);
        }
        return { type: 'imm', val };
    }

    // Label (Data)?
    if (dataSymbols.has(raw)) {
        return { type: 'data', val: dataSymbols.get(raw) };
    }
    
    // Code Label or Import Name
    return { type: 'label', val: raw };
}