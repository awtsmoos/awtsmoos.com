// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteSafety
 * @description
 * The Awtsmoos clothes internal failures in a public vessel, gentle and clear;
 * Awtsmoos.com keeps server paths behind the curtain while useful errors still appear.
 */

const { er } = require('../../general.js');

const HIDDEN_FAILURE_CODES = new Set([
	'TANACH_INDEX_MISSING',
	'TANACH_INDEX_INVALID',
	'TANACH_INDEX_UNAVAILABLE',
	'SEARCH_STORAGE_ERROR'
]);

/**
 * @param {unknown} error Thrown search failure.
 * @returns {{code: string, message: string}} Public-safe error description.
 * @description
 * The Awtsmoos separates the inner vessel from the outer word;
 * infrastructure stays concealed while the caller receives what must be heard.
 */
function revealPublicError(error) {
	const code = typeof error?.code === 'string'
		? error.code
		: 'SEARCH_ERROR';
	const message = typeof error?.message === 'string'
		? error.message
		: 'Search failed';

	if (HIDDEN_FAILURE_CODES.has(code) || containsPrivatePath(message)) {
		return {
			code: 'SEARCH_UNAVAILABLE',
			message: 'Search is temporarily unavailable. Please try again shortly.'
		};
	}

	return {
		code,
		message
	};
}

/**
 * @param {string} message Error text.
 * @returns {boolean} Whether the message appears to expose a local filesystem path.
 */
function containsPrivatePath(message) {
	return /(?:\/mnt\/|\/Users\/|\/home\/|[A-Za-z]:\\)/.test(message);
}

/**
 * @param {() => unknown | Promise<unknown>} task Search task.
 * @returns {Promise<unknown>} Search result or stable error response.
 */
async function safe(task) {
	try {
		return await task();
	} catch (error) {
		return er(revealPublicError(error));
	}
}

module.exports = {
	revealPublicError,
	safe
};
