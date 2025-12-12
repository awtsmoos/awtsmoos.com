/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { OPCODES, PREFIXES, MOD, makeModRM } from './opcodes.js';

/**
 * Handles the generation of machine code bytes.
 */
export class CodeBuilder {
    constructor() {
        this.buffer = [];
        this.callPatches = []; // { offset, funcName }
        this.leaPatches = [];  // { offset, dataLabel } (Label-based data references)
        
        // Label Support
        this.labels = {}; // name -> current byte offset
        // { offset, type: 'rel8'|'rel32', target: string, instSize }
        this.labelPatches = []; 
        
        // Data references (simple relative patches)
        this.dataPatches = []; // { offset, type: 'lea', id: number } - Legacy support for strings
    }
    
    get length() {
        return this.buffer.length;
    }

    addBytes(arr) {
        this.buffer.push(...arr);
    }
    
    add32(val) {
        this.buffer.push(val & 0xFF, (val >> 8) & 0xFF, (val >> 16) & 0xFF, (val >> 24) & 0xFF);
    }

    // --- Labels & Jumps ---
    markLabel(name) {
        this.labels[name] = this.buffer.length;
    }

    // Jump to a label (Short jump 8-bit)
    addJumpRel8(opcode, labelName) {
        this.buffer.push(opcode);
        this.labelPatches.push({ 
            offset: this.buffer.length, 
            type: 'rel8', 
            target: labelName, 
            instSize: 1 
        });
        this.buffer.push(0x00); // Placeholder
    }

    // --- Imports & Data ---
    
    /**
     * Indirect Call to memory location (IAT)
     * Opcode: FF 15 [disp32]
     */
    addCall(funcName) {
        this.buffer.push(OPCODES.CALL_RM64, 0x15); 
        this.callPatches.push({ offset: this.buffer.length, funcName: funcName });
        this.add32(0); // Placeholder
    }
    
    /**
     * LEA RDX, [RIP + disp32]
     * Used for loading string addresses from Data Blob by ID.
     */
    addLeaRel(dataId) {
        // 48 8D 15 xx xx xx xx
        const modRM = makeModRM(MOD.INDIRECT, 2, 5); // RDX
        this.buffer.push(PREFIXES.REX_W, OPCODES.LEA_R64_M, modRM);
        this.dataPatches.push({ offset: this.buffer.length, id: dataId });
        this.add32(0); // Placeholder
    }

    /**
     * LEA Reg, [RIP + disp32] -> To Data Blob ID
     * @param {number} reg - Destination register (0-7)
     * @param {number} dataId - The index of the data/string in the data section
     */
    addLeaRegRel(reg, dataId) {
         // 48 8D (ModRM) xx xx xx xx
         const modRM = makeModRM(MOD.INDIRECT, reg, 5);
         this.buffer.push(PREFIXES.REX_W, OPCODES.LEA_R64_M, modRM);
         this.dataPatches.push({ offset: this.buffer.length, id: dataId });
         this.add32(0);
    }

    /**
     * LEA Reg, [RIP + disp32] -> To Code Label
     * Useful for getting the address of a function (e.g., WndProc).
     * @param {number} reg 
     * @param {string} labelName 
     */
    addLeaLabel(reg, labelName) {
        // 48 8D (ModRM) [disp32]
        const modRM = makeModRM(MOD.INDIRECT, reg, 5);
        this.buffer.push(PREFIXES.REX_W, OPCODES.LEA_R64_M, modRM);
        
        // Patch relative to Next Instruction
        this.labelPatches.push({
            offset: this.buffer.length,
            type: 'rel32',
            target: labelName,
            instSize: 4 // Displacement is 4 bytes long, so Next IP is patchOffset + 4
        });
        
        this.add32(0);
    }

    // --- Finalize ---
    resolveLabels() {
        for(let patch of this.labelPatches) {
            const targetOffset = this.labels[patch.target];
            if (targetOffset === undefined) throw new Error(`Label not found: ${patch.target}`);
            
            // Calculate relative offset
            // Disp = Target - (PatchOffset + SizeOfPatchField)
            // PatchOffset points to the start of the displacement bytes.
            const rel = targetOffset - (patch.offset + patch.instSize);
            
            if (patch.type === 'rel8') {
                if (rel < -128 || rel > 127) throw new Error("Short jump out of range");
                this.buffer[patch.offset] = rel & 0xFF;
            } else if (patch.type === 'rel32') {
                this.buffer[patch.offset] = rel & 0xFF;
                this.buffer[patch.offset+1] = (rel >> 8) & 0xFF;
                this.buffer[patch.offset+2] = (rel >> 16) & 0xFF;
                this.buffer[patch.offset+3] = (rel >> 24) & 0xFF;
            }
        }
    }
}
