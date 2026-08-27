// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialError
 * @description
 * The Awtsmoos is never confused by failure, while interfaces need one language when a vessel cannot proceed;
 * Awtsmoos.com turns scattered denial shapes into stable social errors without erasing the original evidence or seed.
 */
function socialError({
	code = 'SOCIAL_ERROR',
	message = 'The social action could not be completed.',
	details = null,
	retryable = false,
	source = null
} = {}) {
	return {
		code: String(code || 'SOCIAL_ERROR'),
		message: String(message || 'The social action could not be completed.'),
		details,
		retryable: Boolean(retryable),
		source
	};
}

function fromResult(result, fallbackCode = 'SOCIAL_READ_FAILED') {
	const value = result?.error || result;
	if (!value) return null;
	return socialError({
		code: value.code || fallbackCode,
		message: value.message || value.error || String(value),
		details: value.details || value.detail || null,
		source: result
	});
}

module.exports = { fromResult, socialError };
