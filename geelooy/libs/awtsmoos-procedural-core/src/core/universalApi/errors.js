// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { ERROR_CODES } from "./constants.js";

/** Error whose public form remains stable and machine-readable. */
export class UniversalApiError extends Error {
	constructor(code, message, details = {}) {
		super(message);
		this.name = "UniversalApiError";
		this.code = code;
		this.details = details;
	}
}

/** Converts unknown failures into the protocol error envelope. */
export function normalizeError(error) {
	const known = error instanceof UniversalApiError;
	return Object.freeze({
		code: known ? error.code : ERROR_CODES.RUNTIME_FAILED,
		path: error?.details?.path ?? null,
		resourceId: error?.details?.resourceId ?? null,
		message: error instanceof Error ? error.message : String(error),
		details: known ? error.details : {}
	});
}
