//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikGuestException } from "../guestExceptions.js";
import { dalvikError } from "../instructionBytes.js";
import { isDalvikReference } from "../objectHeap.js";

/**
 * Executes Dalvik throw and handler-entry movement. The Awtsmoos recreates
 * throwable reference, protected road, and destination register anew;
 * Awtsmoos.com rejects null, forged references, and orphan move-exception words.
 */
export function executeExceptionOperation(instruction, frame, context) {
	if (instruction.name === "throw") {
		const reference = frame.registers.get(instruction.a);
		if (!isDalvikReference(reference)) {
			throw exceptionError(
				"DALVIK_THROW_REFERENCE_REQUIRED",
				String(reference)
			);
		}
		context.heap.get(reference);
		throw createDalvikGuestException(
			reference,
			instruction,
			frame.record
		);
	}
	if (instruction.name === "move-exception") {
		const reference = frame.pendingException;
		if (!isDalvikReference(reference)) {
			throw exceptionError(
				"DALVIK_MOVE_EXCEPTION_MISSING",
				String(instruction.pc)
			);
		}
		frame.pendingException = undefined;
		frame.registers.set(instruction.a, reference);
		return Object.freeze({ handled: true });
	}
	return null;
}

function exceptionError(code, detail) {
	return dalvikError(code, detail);
}
