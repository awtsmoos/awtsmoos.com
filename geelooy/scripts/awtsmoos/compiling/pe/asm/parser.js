/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { stringToBytes } from '../utils.js';

/**
 * Parses raw ASM source into a structured context.
 * @param {string} source 
 * @returns {Object} { tokens, importDef, dataBlobs, dataSymbols, subsystem, dataRelocs }
 */
export function parseAsm(source) {
    const importDef = [];
    const importMap = new Map(); // DLL Name -> Object
    const dataBlobs = [];
    const dataSymbols = new Map(); // Label -> index in dataBlobs
    const dataRelocs = []; // { blobId, offset, target }
    
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
            // Case 1: String Data -> label: "string"
            const matchStr = line.match(/^(\w+):\s*"(.*)"$/);
            if (matchStr) {
                const label = matchStr[1];
                const rawContent = matchStr[2];
                
                // Robust Escape Parsing
                const bytes = [];
                for(let i=0; i<rawContent.length; i++) {
                    const c = rawContent[i];
                    if (c === '\\') {
                        i++;
                        if (i >= rawContent.length) { bytes.push(92); break; }
                        const next = rawContent[i];
                        if (next === 'n') bytes.push(10);
                        else if (next === 'r') bytes.push(13);
                        else if (next === 't') bytes.push(9);
                        else if (next === '0') bytes.push(0);
                        else if (next === '"') bytes.push(34);
                        else if (next === '\\') bytes.push(92);
                        else if (next === 'x') {
                             const hex = rawContent.substr(i+1, 2);
                             if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                                 bytes.push(parseInt(hex, 16));
                                 i += 2;
                             } else {
                                 bytes.push(92); bytes.push(120);
                             }
                        } else {
                             bytes.push(92); bytes.push(next.charCodeAt(0));
                        }
                    } else {
                        bytes.push(...stringToBytes(c));
                    }
                }
                bytes.push(0); // Null term

                dataSymbols.set(label, dataBlobs.length);
                dataBlobs.push(new Uint8Array(bytes));
                continue;
            }

            // Case 2: Numeric Array or Pointers with Label -> label: 10, 0xFF, SomeLabel
            const matchNum = line.match(/^(\w+):\s*(.+)$/);
            if (matchNum) {
                const label = matchNum[1];
                const rawVals = matchNum[2];
                const { buffer, relocs } = parseDataValues(rawVals);
                
                const blobId = dataBlobs.length;
                relocs.forEach(r => {
                    dataRelocs.push({ blobId, offset: r.offset, target: r.target });
                });

                dataSymbols.set(label, blobId);
                dataBlobs.push(buffer);
                continue;
            }

            // Case 3: 'db' directive or raw values (continuation)
            if (line.match(/^(?:db|DB)\s+(.+)$/)) {
                const rawVals = line.replace(/^(?:db|DB)\s+/i, '');
                const { buffer, relocs } = parseDataValues(rawVals);

                // Append to last blob if exists to keep alignment/grouping
                if (dataBlobs.length > 0) {
                    const lastBlobIdx = dataBlobs.length - 1;
                    const lastBlob = dataBlobs[lastBlobIdx];
                    
                    // Create merged buffer
                    const merged = new Uint8Array(lastBlob.length + buffer.length);
                    merged.set(lastBlob);
                    merged.set(buffer, lastBlob.length);
                    dataBlobs[lastBlobIdx] = merged;

                    // Adjust relocs
                    relocs.forEach(r => {
                         dataRelocs.push({ 
                             blobId: lastBlobIdx, 
                             offset: lastBlob.length + r.offset, 
                             target: r.target 
                         });
                    });
                } else {
                    // Create anonymous blob
                    const blobId = dataBlobs.length;
                    relocs.forEach(r => {
                        dataRelocs.push({ blobId, offset: r.offset, target: r.target });
                    });
                    dataBlobs.push(buffer);
                }
                continue;
            }

            throw new Error("Invalid data definition: " + line);
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
                tokens.push({ type: 'instr', mnemonic: line.toUpperCase(), args: [] });
            } else {
                const mnemonic = line.substring(0, firstSpace).trim().toUpperCase();
                const argsStr = line.substring(firstSpace).trim();
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
        subsystem,
        dataRelocs
    };
}

// Helper to parse comma-separated data values
function parseDataValues(rawVals) {
    const parts = rawVals.split(',').map(s => s.trim());
    const bufferParts = [];
    const relocs = [];

    for (let part of parts) {
        if (part.match(/^-?0x[0-9A-Fa-f]+$/) || part.match(/^-?\d+$/)) {
            let val;
            if (part.toLowerCase().includes('0x')) {
                const isNeg = part.startsWith('-');
                const clean = part.replace('-', '');
                val = parseInt(clean, 16);
                if (isNeg) val = -val;
            } else {
                val = parseInt(part, 10);
            }
            bufferParts.push(val & 0xFF);
        } else {
            // Symbol: assume 64-bit pointer
            for(let k=0; k<8; k++) bufferParts.push(0);
            relocs.push({
                offset: bufferParts.length - 8,
                target: part
            });
        }
    }
    return { buffer: new Uint8Array(bufferParts), relocs };
}
