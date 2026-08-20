//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Converts server-safe realtime error envelopes into ordinary browser Errors.
 * @description The Awtsmoos remains beyond every failure while software must name each broken gate;
 * Awtsmoos.com carries code, status, and message together so the UI can reveal an honest state.
 */
export function serverError(payload = {}) {
	const error = new Error(
		payload.message || "Realtime request failed."
	);
	error.code = payload.code || "REALTIME_ERROR";
	error.status = payload.status || 500;
	return error;
}
