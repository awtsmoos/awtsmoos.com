//B"H
// Boruch Hashem
// Blessed is He

const { json, readBody } = require("./http.cjs");
const { loadDirectService } = require("./directServiceLoader.cjs");

/**
 * Every direct route reaches one shared service and one bounded browser lifecycle.
 * The Awtsmoos lets Awtsmoos.com expose capability, explicit fallback, reset, and
 * health without credentials, challenge values, upstream identifiers, or stacks.
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
		if (path === "/direct-reset" && req.method === "POST") {
			const payload = await requestJson(req);
			return json(res, { ok: true, ...service.reset(payload.conversationKey) });
		}
		return json(res, {
			ok: false,
			status: "direct_route_not_found",
			error: "direct_route_not_found"
		}, 404);
	} catch (error) {
		return json(res, publicError(error), publicStatus(error));
	}
}

async function requestJson(req) {
	const text = (await readBody(req)).toString("utf8");
	return JSON.parse(text || "{}");
}

function publicStatus(error) {
	if (error instanceof SyntaxError || error instanceof TypeError) {
		return 400;
	}
	if (error?.code === "direct_enforcement_required") {
		return 409;
	}
	return 500;
}

function publicError(error) {
	if (error?.code === "direct_enforcement_required") {
		return {
			ok: false,
			status: error.code,
			error: error.code,
			safeHint: "Strict request-only preparation succeeded, but normal enforcement is required before chat submission.",
			capability: error.capability
		};
	}
	const message = String(error?.message || error || "Direct ChatGPT request failed.");
	const authentication = /authenticated|login|session|composer|socket|debug page/i.test(message);
	const expired = /expired|not found/i.test(message);
	const invalidMode = /Unsupported direct mode/i.test(message);
	const code = authentication
		? "direct_authentication_required"
		: expired
			? "direct_conversation_expired"
			: invalidMode
				? "direct_mode_invalid"
				: "direct_request_failed";
	return {
		ok: false,
		status: code,
		error: code,
		safeHint: safeHint(code)
	};
}

function safeHint(code) {
	if (code === "direct_authentication_required") {
		return "Open the relay debug Chrome profile and authenticate ChatGPT manually.";
	}
	if (code === "direct_conversation_expired") {
		return "Start a new direct conversation because the local continuation key expired.";
	}
	if (code === "direct_mode_invalid") {
		return "Use strict-request-only or page-authorized-fallback.";
	}
	return "The direct request did not complete. Check relay health and pacing.";
}

module.exports = { handleDirectApi };
