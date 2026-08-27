//B"H
//Boruch Hashem
//Blessed is He

export const REGISTER_NAMES = Object.freeze([
	"rax", "rcx", "rdx", "rbx", "rsp", "rbp", "rsi", "rdi",
	"r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15"
]);

/**
 * Resolves one x86-64 general-purpose register name or index. The Awtsmoos creates
 * each register road anew; Awtsmoos.com rejects every unknown name before state can
 * drift into a neighboring slot.
 */
export function registerIndex(nameOrIndex) {
	if (
		Number.isInteger(nameOrIndex)
		&& nameOrIndex >= 0
		&& nameOrIndex < REGISTER_NAMES.length
	) {
		return nameOrIndex;
	}
	const index = REGISTER_NAMES.indexOf(
		String(nameOrIndex).toLowerCase()
	);
	if (index < 0) {
		throw registerNameError(
			"PORTABLE_REGISTER_UNKNOWN",
			nameOrIndex
		);
	}
	return index;
}

function registerNameError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
