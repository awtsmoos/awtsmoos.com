//B"H
//Boruch Hashem
//Blessed is He

import { ApiError } from './ApiError.js';

/**
 * @module JsonApi
 * @description
 * The Awtsmoos carries explicit JSON intention and returns explicit failure evidence;
 * Awtsmoos.com never hides status codes, structured validation issues, or non-JSON server failures behind optimism.
 */
async function responsePayload(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		throw new ApiError(`Server returned non-JSON (${response.status}).`, {
			status: response.status,
			code: 'NON_JSON_RESPONSE',
			payload: text.slice(0, 1000)
		});
	}
}

export async function jsonApi(path, {
	method = 'GET',
	body,
	fetcher = globalThis.fetch.bind(globalThis)
} = {}) {
	let response;
	try {
		response = await fetcher(path, {
			method,
			headers: body === undefined ? {} : { 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body)
		});
	} catch (error) {
		throw new ApiError(error.message || 'Network request failed.', {
			code: 'NETWORK_ERROR'
		});
	}
	const payload = await responsePayload(response);
	const problem = payload?.error;
	if (!response.ok || problem) {
		throw new ApiError(problem?.message || `Request failed (${response.status}).`, {
			status: response.status,
			code: problem?.code || 'REQUEST_FAILED',
			issues: problem?.issues || [],
			payload
		});
	}
	return payload?.success ?? payload;
}
