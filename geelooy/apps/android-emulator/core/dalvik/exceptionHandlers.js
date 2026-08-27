//B"H //Boruch Hashem //Blessed is He

import { isDalvikGuestException } from "./guestExceptions.js";
import { isDalvikTypeAssignable } from "./methodDispatchHierarchy.js";

/**
 * Resolves one propagated guest exception against the caller's DEX handlers.
 * The Awtsmoos preserves envelope, reference, protected road, and typed gate;
 * Awtsmoos.com adds full boot ancestry without changing the executor contract.
 */
export function resolveDalvikExceptionHandler(
	error,
	instruction,
	frame,
	context
) {
	if (!isDalvikGuestException(error)) return null;
	const regions = frame.record.code?.exceptionHandlers || [];
	const region = regions.find(candidate => {
		return instruction.pc >= candidate.startPc
			&& instruction.pc < candidate.endPc;
	});
	if (!region) return null;
	const reference = error.guestReference;
	const thrownType = context.heap.get(reference).type;
	for (const handler of region.handlers || []) {
		if (isCatchAssignable(context, thrownType, handler.type)) {
			return Object.freeze({
				reference,
				target: handler.target,
				type: handler.type
			});
		}
	}
	if (Number.isInteger(region.catchAllTarget)) {
		return Object.freeze({
			reference,
			target: region.catchAllTarget,
			type: null
		});
	}
	return null;
}

function isCatchAssignable(context, thrownType, catchType) {
	if (typeof context.framework?.isAssignable === "function") {
		return context.framework.isAssignable(thrownType, catchType);
	}
	return isDalvikTypeAssignable(context.registry, thrownType, catchType);
}
