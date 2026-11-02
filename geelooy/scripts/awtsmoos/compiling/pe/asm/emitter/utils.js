/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { MOD, makeModRM, makeSIB } from '../opcodes.js';

/**
 * Converts an immediate operand value (number or BigInt) to its low 32 bits
 * as an explicit number. B"H: a BigInt immediate must never mix with number
 * bitwise operators (throws 'Cannot mix BigInt and other types'); mask as
 * BigInt first, then convert explicitly.
 * @param {number|bigint} val - Immediate value.
 * @returns {number} Low 32 bits of the immediate as a number.
 */
export function immToUint32(val) {
    return Number(BigInt(val) & 0xFFFFFFFFn);
}

/**
 * Emits the ModRM, SIB, and Displacement bytes for a memory operand.
 * @param {Object} memOp - The memory operand structure {base, index, disp, scale}.
 * @param {number} regCode - The register code (0-7) to go in the 'reg' field of ModRM.
 * @returns {Array<number>} The array of bytes.
 */
export function emitMemBytes(memOp, regCode) {
    const { base, index, disp, scale } = memOp;
    const bytes = [];
    
    let mod = MOD.DISP32;
    // Optimization: Use shorter displacement modes if possible
    if (disp === 0 && (base & 7) !== 5) mod = MOD.INDIRECT;
    else if (disp >= -128 && disp <= 127) mod = MOD.DISP8;
    
    // Force SIB if Index is present OR Base is RSP/R12 (4)
    const needsSib = (index !== null) || ((base & 7) === 4);
    
    const rmField = needsSib ? 4 : (base & 7);
    const modRM = makeModRM(mod, regCode & 7, rmField);
    bytes.push(modRM);
    
    if (needsSib) {
        const sibIndex = (index !== null) ? (index & 7) : 4;
        const sibBase = base & 7;
        const sib = makeSIB(scale || 0, sibIndex, sibBase);
        bytes.push(sib);
    }
    
    if (mod === MOD.DISP32) {
         bytes.push(disp & 0xFF, (disp >> 8) & 0xFF, (disp >> 16) & 0xFF, (disp >> 24) & 0xFF);
    } else if (mod === MOD.DISP8) {
         bytes.push(disp & 0xFF);
    }
    
    return bytes;
}