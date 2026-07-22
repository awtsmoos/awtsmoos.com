//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikGuestException } from "./guestExceptions.js";
import { isDalvikTypeAssignable } from "./methodDispatchHierarchy.js";

/**
 * Resolves one guest exception against the current frame's protected regions.
 * The Awtsmoos recreates thrown type, typed gate, catch-all road, and target anew;
 * Awtsmoos.com never lets a host error enter a guest catch clause.
 */
export function resolveDalvikExceptionHandler(
	error,
	instruction,
	frame,
	context
) {
	if (!isDalvikGuestException(error)) return null;
	const region = (frame.record.code.exceptionHandlers || []).find(item => {
		return instruction.pc >= item.startPc && instruction.pc < item.endPc;
	});
	if (!region) return null;
	const thrownType = context.heap.get(error.guestReference).type;
	for (const handler of region.handlers) {
		if (isDalvikTypeAssignable(
			context.registry,
			thrownType,
			handler.type
		)) {
			return resolution(error.guestReference, handler.target, handler.type);
		}
	}
	if (region.catchAllTarget !== null) {
		return resolution(error.guestReference, region.catchAllTarget, null);
	}
	return null;
}

function resolution(reference, target, type) {
	return Object.freeze({ reference, target, type });
}
