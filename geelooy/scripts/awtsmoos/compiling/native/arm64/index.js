/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * ARM64 machine-code emitter — public API.
 *
 * Pure JavaScript, zero dependencies. Assembles AArch64 assembly text
 * (one instruction per line, `label:` labels) into little-endian machine
 * code bytes. All AArch64 instructions are fixed 32-bit words.
 */
export * as encoder from "./encoder.js";
export { assemble } from "./assembler.js";
import { assemble } from "./assembler.js";

/**
 * Assemble ARM64 source text.
 * @param {string} source - assembly text, one instruction per line
 * @returns {{ bytes: Uint8Array, symbols: Object, relocations: Array }}
 *   bytes: little-endian machine code (code words, then data blobs)
 *   symbols: label name -> byte offset in bytes
 *   relocations: [{ offset, type, target }] for each resolved label reference
 */
export function assembleArm64(source) {
	return assemble(source);
}

export default { assembleArm64, assemble };
