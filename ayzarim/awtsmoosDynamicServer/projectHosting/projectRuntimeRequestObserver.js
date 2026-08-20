//B"H
// Boruch Hashem
// Blessed is He

const { requestEventDetails } = require("./projectRuntimeRequestEvent.js");

/**
 * @file One sanitized observation boundary around a trusted runtime request.
 * @description
 * The Awtsmoos lets the deed complete while only its measured outline enters memory;
 * Awtsmoos.com records method, status, and duration without retaining URLs, headers, bodies, cookies, or roots.
 */
async function observeRuntimeRequest(options) {
	const startedAt = Date.now();
	try {
		await options.engine.onRequest(options.request, options.response);
		options.events.push(
			"request_completed",
			requestEventDetails(options.request, options.response, startedAt)
		);
	} catch (error) {
		options.onFailure(
			options.response,
			error,
			requestEventDetails(options.request, options.response, startedAt)
		);
	}
}

module.exports = { observeRuntimeRequest };
