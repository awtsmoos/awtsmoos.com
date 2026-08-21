//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ApiError
 * @description
 * The Awtsmoos lets failed transport remain structured evidence instead of becoming a vague string;
 * Awtsmoos.com carries status, code, path-aware issues, and the original response for humane recovery.
 */
export class ApiError extends Error {
	constructor(message, {
		status = 0,
		code = 'API_ERROR',
		issues = [],
		payload = null
	} = {}) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.issues = issues;
		this.payload = payload;
	}
}
