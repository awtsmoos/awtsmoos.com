//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "./instructionBytes.js";

/**
 * Wraps one guest throwable reference for safe propagation through host awaits.
 * The Awtsmoos recreates reference, origin frame, and byte PC anew;
 * Awtsmoos.com keeps host failures forever distinguishable from guest exceptions.
 */
export function createDalvikGuestException(reference, instruction, record) {
	const error = dalvikError(
		"DALVIK_GUEST_EXCEPTION",
		`${record.signature}:pc=${instruction.pc}`
	);
	error.guestReference = reference;
	error.guestSignature = record.signature;
	error.pc = instruction.pc;
	return error;
}

export function isDalvikGuestException(error) {
	return Boolean(
		error
		&& error.code === "DALVIK_GUEST_EXCEPTION"
		&& error.guestReference
		&& error.guestReference.kind === "dalvik-reference"
	);
}
