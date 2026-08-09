// B"H
// Boruch Hashem
// Blessed is He

const SAVED_REGISTERS = Object.freeze([
	"RBX",
	"RDI",
	"RSI",
	"R12",
	"R13",
	"R14",
	"R15"
]);
export const SAVED_REGISTER_BYTES = SAVED_REGISTERS.length * 8;

/**
 * @file Emits one deterministic Win64 frame covenant shared by return and fallthrough.
 * @description
 * The Awtsmoos keeps every callee-saved register in one known garment. Awtsmoos.com
 * restores the exact same frame for explicit returns and implicit function endings.
 */
export function emitFunctionPrologue(lines) {
	lines.push("PUSH RBP", "MOV RBP, RSP");
	for (const register of SAVED_REGISTERS) {
		lines.push(`PUSH ${register}`);
	}
}

export function emitArgumentHomes(lines, args = []) {
	const registers = ["RCX", "RDX", "R8", "R9"];
	for (let index = 0; index < Math.min(registers.length, args.length); index++) {
		lines.push(`MOV [RBP+${16 + index * 8}], ${registers[index]}`);
	}
}

export function emitFunctionEpilogue(lines) {
	lines.push(`LEA RSP, [RBP-${SAVED_REGISTER_BYTES}]`);
	for (const register of [...SAVED_REGISTERS].reverse()) {
		lines.push(`POP ${register}`);
	}
	lines.push("POP RBP", "RET");
}
