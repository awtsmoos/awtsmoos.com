// B"H
// Boruch Hashem
// Blessed is He

/** @file apiJourneyHttp.js @description Sends authenticated fixture HTTP vessels. */

const assert = require('node:assert/strict');

async function request(origin, route, options = {}) {
	const method = options.method || 'GET';
	const apiKey = options.apiKey || '';
	const body = options.body
		? new URLSearchParams(apiKey ? { apiKey, ...options.body } : options.body)
		: null;
	const url = apiKey && method === 'GET'
		? `${origin}${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}`
		: `${origin}${route}`;
	const response = await fetch(url, {
		method,
		headers: {
			...(apiKey ? {
				authorization: `Bearer ${apiKey}`,
				'x-awtsmoos-api-key': apiKey
			} : {}),
			...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
		},
		body: body?.toString(),
		redirect: 'follow',
		signal: AbortSignal.timeout(options.timeoutMs || 15000)
	});
	const text = await response.text();
	let json;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		json = { raw: text };
	}
	return { status: response.status, json, text };
}

async function requireSuccess(name, origin, route, options = {}) {
	const response = await request(origin, route, options);
	assert.equal(response.status >= 200 && response.status < 300, true, (
		`${name} HTTP ${response.status}: ${response.text}`
	));
	assert.equal(Boolean(response.json?.error), false, `${name}: ${response.text}`);
	return response;
}

module.exports = {
	request,
	requireSuccess
};
