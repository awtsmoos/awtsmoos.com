//B"H
// Boruch Hashem
// Blessed is He

const { json, readBody } = require("./http.cjs");
const { loadDirectService } = require("./directServiceLoader.cjs");

/**
 * Direct routes expose strict native HTTP, transcript retrieval, explicit browser
 * fallback, reset, and health without credentials, provider ids, or stacks.
 */
async function handleDirectApi(req, res, path, config = {}) {
	try {
		const service = await loadDirectService(config);
		if (path === "/direct-health" && req.method === "GET") {
			return json(res, service.status());
		}
		if (path === "/direct-capability" && req.method === "GET") {
			return json(res, await service.capability());
		}
		if (path === "/direct-chat" && req.method === "POST") {
			return json(res, await service.send(await requestJson(req)));
		}
		if (path === "/direct-conversation" && req.method === "POST") {
			const payload = await requestJson(req);
			return json(res, service.conversation(payload.conversationKey));
		}
		if (path === "/direct-reset" && req.method === "POST") {
			const payload = await requestJson(req);
			return json(res, { ok: true, ...service.reset(payload.conversationKey) });
		}
		return json(res, fixedError("direct_route_not_found", "Direct route was not found."), 404);
	} catch (error) {
		return json(res, publicError(error), publicStatus(error));
	}
}

async function requestJson(req) {
	const text = (await readBody(req)).toString("utf8");
	return JSON.parse(text || "{}");
}

function publicStatus(error) {
	if (error instanceof SyntaxError || error instanceof TypeError) return 400;
	if (error?.code === "direct_conversation_expired") return 404;
	if ([
		"official_api_key_required",
		"local_model_unavailable",
		"request_only_provider_unavailable"
	].includes(error?.code)) return 503;
	if ([
		"official_api_request_failed",
		"official_api_response_invalid",
		"local_model_request_failed",
		"local_model_response_invalid"
	].includes(error?.code)) return 502;
	return 500;
}

function publicError(error) {
	if (error?.code === "request_only_provider_unavailable") {
		return {
			...fixedError(error.code,
				"Start the localhost model or configure the server-side OpenAI credential."),
			capability: error.capability
		};
	}
	if (error?.code === "official_api_key_required") {
		return fixedError(error.code,
			"Configure the server-side OpenAI credential or use strict mode with the local model.");
	}
	if (error?.code === "local_model_unavailable") {
		return fixedError(error.code, "Start the localhost model server on port 18080.");
	}
	if (error?.code === "direct_conversation_expired") {
		return fixedError(error.code, "The opaque local conversation key expired or was not found.");
	}
	if (/^(official_api|local_model)_(request_failed|response_invalid)$/.test(error?.code || "")) {
		return fixedError(error.code, "The selected request-only provider did not complete safely.");
	}
	const message = String(error?.message || error || "Direct request failed.");
	const authentication = /authenticated|login|session|composer|socket|debug page/i.test(message);
	const expired = /expired|not found|belongs to another transport/i.test(message);
	const invalidMode = /Unsupported direct mode/i.test(message);
	const code = authentication
		? "direct_authentication_required"
		: expired
			? "direct_conversation_expired"
			: invalidMode ? "direct_mode_invalid" : "direct_request_failed";
	return fixedError(code, safeHint(code));
}

function fixedError(code, safeHint) {
	return { ok: false, status: code, error: code, safeHint };
}

function safeHint(code) {
	if (code === "direct_authentication_required") {
		return "Authenticate the relay debug Chrome profile for explicit browser fallback.";
	}
	if (code === "direct_conversation_expired") {
		return "Start a new conversation because the local continuation key expired.";
	}
	if (code === "direct_mode_invalid") {
		return "Use strict-request-only, official-api-request-only, local-request-only, or page-authorized-fallback.";
	}
	return "The direct request did not complete. Check request-only capability and pacing.";
}

module.exports = { handleDirectApi };
