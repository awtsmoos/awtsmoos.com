//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module APICore
 * @description
 * The Awtsmoos gives read requests a small bounded recovery path so one
 * transient origin rupture does not erase already-rendered Torah. Mutating
 * requests remain single-shot to prevent accidental duplicate side effects.
 */

export const BASE_API_URL = '/api/social/';

const GET_ATTEMPTS = 2;
const RETRY_DELAY_MS = 120;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Retrieves JSON with one bounded retry for transient read failures.
 * @param {string} url Absolute or same-origin API URL.
 * @returns {Promise<unknown|null>} Parsed JSON, or null after bounded failure.
 */
export async function fetchData(url) {
	let finalError = null;
	for (let attempt = 1; attempt <= GET_ATTEMPTS; attempt += 1) {
		try {
			const response = await fetch(url);
			if (response.ok) return await response.json();
			finalError = responseError('API Gateway Rupture', response);
			if (!RETRYABLE_STATUS.has(response.status)) break;
		} catch (error) {
			finalError = error;
		}
		if (attempt < GET_ATTEMPTS) await retryDelay(attempt);
	}
	console.error('B"H - Fetch failure at path:', url, finalError);
	return null;
}

/**
 * Sends one mutation exactly once so retry cannot duplicate a side effect.
 * @param {string} url Absolute or same-origin API URL.
 * @param {BodyInit} body Request body accepted by fetch.
 * @returns {Promise<unknown|null>} Parsed JSON, or null on failure.
 */
export async function postData(url, body) {
	try {
		const response = await fetch(url, {
			method: 'POST',
			body
		});
		if (!response.ok) {
			throw responseError('API Submission Rupture', response);
		}
		return await response.json();
	} catch (error) {
		console.error('B"H - Posting failure at path:', url, error);
		return null;
	}
}

/** Builds one compact transport error without leaking response bodies. */
function responseError(prefix, response) {
	return new Error(`${prefix}: ${response.status} ${response.statusText}`);
}

/** Applies a tiny increasing delay before the final read attempt. */
function retryDelay(attempt) {
	return new Promise(resolve => {
		setTimeout(resolve, RETRY_DELAY_MS * attempt);
	});
}
