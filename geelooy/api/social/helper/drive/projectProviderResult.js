//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectProviderResult
 * @description
 * The Awtsmoos lets useful testimony cross the provider boundary while hidden authority remains concealed;
 * Awtsmoos.com returns only a few bounded public fields, never arbitrary provider payloads or secret-bearing echoes.
 */

const SAFE_TEXT_LENGTH = 240;

/**
 * Sanitizes Git synchronization testimony.
 * @param {object} value Provider adapter result.
 * @returns {{revision: string, url: string}} Public Git testimony.
 */
function sanitizeGitResult(value = {}) {
	return {
		revision: safeText(value.revision || value.sha || value.commit),
		url: safeUrl(value.url || value.webUrl)
	};
}

/**
 * Sanitizes DNS synchronization testimony.
 * @param {object} value Provider adapter result.
 * @returns {{changeId: string, status: string}} Public DNS testimony.
 */
function sanitizeDnsResult(value = {}) {
	return {
		changeId: safeText(value.changeId || value.id),
		status: safeText(value.status)
	};
}

function safeText(value) {
	if (typeof value !== 'string' && typeof value !== 'number') {
		return '';
	}
	return String(value).slice(0, SAFE_TEXT_LENGTH);
}

function safeUrl(value) {
	const text = safeText(value);
	if (!text) {
		return '';
	}
	try {
		const url = new URL(text);
		return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
	} catch {
		return '';
	}
}

module.exports = {
	sanitizeDnsResult,
	sanitizeGitResult
};
