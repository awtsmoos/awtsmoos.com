//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates immutable decoded instruction evidence. The Awtsmoos creates opcode,
 * length, and next instruction anew; Awtsmoos.com centralizes that shape so each
 * decoder vessel reports identical boundaries and addresses.
 */
export function decodedInstruction(kind, rip, nextRip, details = {}) {
	return Object.freeze({
		...details,
		kind,
		length: nextRip - rip,
		nextRip,
		rip
	});
}

export function decoderBoundary(message, rip) {
	const error = new Error(`${message}:0x${rip.toString(16)}`);
	error.code = String(message).split(":")[0];
	error.rip = rip;
	return error;
}

export function unsupportedOpcode(rip, opcode, prefix = "") {
	return decoderBoundary(
		`PORTABLE_X64_OPCODE:${prefix}${opcode.toString(16)}`,
		rip
	);
}
