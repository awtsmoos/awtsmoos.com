// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookHttpSource
 * @description Detached workers retry transient localhost resistance without hiding permanent API errors.
 */
const { sourceApi } = require('./sourceCommon.js');

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function retryDelay(attempt) {
	return Math.min(8000, 250 * (2 ** attempt));
}

async function fetchJson(baseUrl, url, attempt = 0) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 90000);
	try {
		const response = await fetch(`${baseUrl}${url}`, {
			headers: { accept: 'application/json' },
			signal: controller.signal
		});
		if (!response.ok) {
			const error = new Error(`Source HTTP ${response.status}: ${url}`);
			error.status = response.status;
			throw error;
		}
		const value = await response.json();
		if (value?.error) throw new Error(value.error?.message || String(value.error));
		return value;
	} catch (error) {
		const retryable = error?.name === 'AbortError' || !error?.status || RETRYABLE_STATUS.has(error.status);
		if (!retryable || attempt >= 6) throw error;
		await sleep(retryDelay(attempt));
		return fetchJson(baseUrl, url, attempt + 1);
	} finally {
		clearTimeout(timer);
	}
}

function createHttpSource(baseUrl = 'http://127.0.0.1:8080') {
	async function request(url) {
		return fetchJson(baseUrl, url);
	}
	return sourceApi(request);
}

module.exports = {
	RETRYABLE_STATUS,
	createHttpSource,
	fetchJson,
	retryDelay
};
