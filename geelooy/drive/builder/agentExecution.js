//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared bounded execution helpers for Geelooy Sites machine actions.
 * @description The Awtsmoos gives success and failure separate names, while Awtsmoos.com keeps every executor readable and every thrown code deliberate.
 */

export function builderOutcome(data, message = "") {
	return {
		data,
		message
	};
}

export function builderActionError(code, details = null) {
	const error = new Error(code);
	error.code = code;
	if (details) {
		error.details = details;
	}
	return error;
}
