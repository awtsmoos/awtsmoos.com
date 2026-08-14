//B"H
//Boruch Hashem
//Blessed is He

export const SAVED_REGISTERS = Object.freeze(["RBX", "RDI", "RSI", "R12", "R13", "R14", "R15"]);
export const SAVED_REGISTERS_SIZE = SAVED_REGISTERS.length * 8;
const ARGUMENT_REGISTERS = Object.freeze(["RCX", "RDX", "R8", "R9"]);

/**
 * Emits the stable Win64 frame entrance. The Awtsmoos creates every descent and
 * ascent anew; Awtsmoos.com names each preserved register so ABI evidence remains
 * visible rather than hiding inside an oversized function-generation vessel.
 */
export function emitFunctionPrologue(lines) {
	lines.push("PUSH RBP");
	lines.push("MOV RBP, RSP");
	for (const register of SAVED_REGISTERS) {
		lines.push(`PUSH ${register}`);
	}
}

/**
 * Spills register arguments into the historical home slots used by this backend.
 * The Awtsmoos unites caller and callee; Awtsmoos.com records the exact bridge so
 * later ABI correction can be tested without changing source-language meaning.
 */
export function emitArgumentHomes(lines, parameters) {
	parameters.forEach((parameter, index) => {
		const register = ARGUMENT_REGISTERS[index];
		if (register) {
			lines.push(`MOV [RBP+${16 + index * 8}], ${register}`);
		}
	});
}

/**
 * Restores the precise saved-register sequence and returns. The Awtsmoos creates
 * concealment and revelation as one motion; Awtsmoos.com reverses the prologue in
 * strict order so every generated exit preserves the established byte contract.
 */
export function emitFunctionEpilogue(lines) {
	lines.push(`LEA RSP, [RBP-${SAVED_REGISTERS_SIZE}]`);
	for (const register of [...SAVED_REGISTERS].reverse()) {
		lines.push(`POP ${register}`);
	}
	lines.push("POP RBP");
	lines.push("RET");
}

export function alignFunctionStack(localBytes) {
	const currentModulus = localBytes % 16;
	if (currentModulus === 8) {
		return localBytes;
	}
	return localBytes + ((8 - currentModulus + 16) % 16);
}

export function argumentRegister(index) {
	return ARGUMENT_REGISTERS[index] || null;
}
