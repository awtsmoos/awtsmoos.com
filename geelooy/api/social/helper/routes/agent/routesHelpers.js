//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesHelpers
 * @description
 * Sibling of AgentTranslateRoutes: header, auth and rate-limit helpers, relocated verbatim.
 */

const { verifyApiKey, apiKeyFromRequest } = require('../../apiKeys.js');
const { er } = require('../../general.js');
const engine = require('./engine.js');

function requestHeader($i, name) {
	const headers = $i?.request?.headers || $i?.headers || {};
	const lower = String(name).toLowerCase();
	for (const key of Object.keys(headers)) {
		if (String(key).toLowerCase() === lower) return headers[key];
	}
	return null;
}

async function requireAgent($i) {
	const verified = await verifyApiKey({ $i });
	if (verified && verified.success) {
		const supplied = apiKeyFromRequest($i) || '';
		return { ok: true, userId: verified.success.userId, credentialHash: engine.sha256(supplied) };
	}
	return { ok: false, error: verified };
}

function rateLimited(rl) {
	return er({ code: 'RATE_LIMITED', message: 'Rate limit exceeded.', retryAfterMs: rl.retryAfterMs, limit: rl.limit });
}

function withRateLimit(body, rl) {
	return { ...body, rateLimit: { limit: rl.limit, remaining: rl.remaining, resetMs: rl.resetMs } };
}

module.exports = {
	requestHeader,
	requireAgent,
	rateLimited,
	withRateLimit
};
