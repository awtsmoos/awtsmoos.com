/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { stringToBytes } from './utils.js';

/**
 * Calculates sizes and constructs the Import Table helper object.
 * @param {Array} importDef - Array of DLL definitions.
 */
export function buildImportTable(importDef) {
    let iatSize = 0;
    let namesSize = 0;
    
    importDef.forEach(dll => {
        // IAT/ILT = (NumFuncs + 1 NULL) * 8
        iatSize += (dll.funcs.length + 1) * 8;
        
        // Names: DLL Name + (Hint(2) + FuncName + Null) + padding
        let dLen = dll.name.length;
        if (dLen % 2 !== 0) dLen++;
        namesSize += dLen;
        
        dll.funcs.forEach(f => {
            let fLen = 2 + f.length;
            if (fLen % 2 !== 0) fLen++;
            namesSize += fLen;
        });
    });

    return {
        iatSize,
        iltSize: iatSize, // Identical copy
        idtSize: (importDef.length + 1) * 20, // +1 Null IDT
        namesSize,
        definitions: importDef
    };
}
