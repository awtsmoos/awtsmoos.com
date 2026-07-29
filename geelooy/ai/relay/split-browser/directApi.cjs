//B"H
// Boruch Hashem
// Blessed is He

const { json, readBody } = require("./http.cjs");
const { loadDirectService } = require("./directServiceLoader.cjs");

/**
 * Direct routes expose only the authenticated ChatGPT website transport, local
 * opaque continuation keys, health, capability, and reset. No provider selection,
 * credentials, browser secrets, upstream ids, or stack traces cross this boundary.
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
	if (/expired|not found/i.test(String(error?.message || error))) return 404;
	if (/authenticated|login|session|Chrome debug browser/i.test(String(error?.message || error))) {
		return 503;
	}
	return 500;
}

function publicError(error) {
	const message = String(error?.message || error || "ChatGPT website request failed.");
	const authentication = /authenticated|login|session|Chrome debug browser/i.test(message);
	const expired = /expired|not found/i.test(message);
	const invalidMode = /Unsupported direct mode/i.test(message);
	const code = authentication
		? "chatgpt_login_required"
		: expired
			? "direct_conversation_expired"
			: invalidMode ? "direct_mode_invalid" : "chatgpt_website_request_failed";
	return fixedError(code, safeHint(code));
}

function fixedError(code, safeHint) {
	return { ok: false, status: code, error: code, safeHint };
}

function safeHint(code) {
	if (code === "chatgpt_login_required") {
		return "A visible ChatGPT login window will open automatically on the next website turn.";
	}
	if (code === "direct_conversation_expired") {
		return "Start a new ChatGPT website conversation because the local key expired.";
	}
	if (code === "direct_mode_invalid") return "Use chatgpt-website mode.";
	return "The ChatGPT website turn did not complete. Check login and retry once.";
}

module.exports = { handleDirectApi };
