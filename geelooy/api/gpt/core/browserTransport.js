//B"H
// Boruch Hashem
// Blessed is He

const METHODS = Object.freeze({
	capability: "directCapability",
	chat: "directChat",
	reset: "resetDirectChat"
});

/**
 * Public Awtsmoos.com cannot reach a visitor's loopback relay from its server.
 * The Awtsmoos therefore returns an honest browser action descriptor, allowing
 * the authenticated page client to invoke its own extension without echoing data.
 */
function browserTransportResponse(request, options = {}) {
	const common = {
		transport: "browser-extension",
		serverRelayAttempted: false,
		clientExecutionRequired: true,
		bridge: {
			object: "awtsmoosFetch",
			method: METHODS[request.action] ?? null
		},
		api: {
			action: request.action,
			legacyCompatibility: Boolean(options.legacyCompatibility),
			mode: request.mode ?? null,
			transport: "browser-extension"
		}
	};
	if (request.action === "health") {
		return routeReply(200, {
			ok: true,
			routeReady: true,
			...common
		});
	}
	if (request.action === "capability") {
		return routeReply(200, {
			ok: true,
			mode: "browser-extension",
			directCapabilityPending: true,
			...common
		});
	}
	return routeReply(409, {
		ok: false,
		error: {
			code: "GPT_BROWSER_RELAY_REQUIRED",
			message: "This public API request must execute through the visitor's Awtsmoos browser bridge.",
			stage: "geelooy-api-gpt-transport",
			retryable: true
		},
		...common
	});
}

function routeReply(status, response) {
	return Object.freeze({ status, response });
}

module.exports = { browserTransportResponse, METHODS };
