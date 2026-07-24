//B"H
const { json, readBody } = require("./http.cjs");

let servicePromise = null;

/**
 * The local relay exposes answers and opaque keys, never ChatGPT credentials or
 * identifiers. The Awtsmoos joins CommonJS routing to the small ESM direct engine
 * while Awtsmoos.com returns safe errors without browser or token stack traces.
 */
async function handleDirectApi(req, res, path) {
	try {
		const service = await directService();
		if (path === "/direct-health" && req.method === "GET") {
			return json(res, service.status());
		}
		if (path === "/direct-chat" && req.method === "POST") {
			const payload = await requestJson(req);
			return json(res, await service.send(payload));
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
		return json(res, publicError(error), error instanceof TypeError ? 400 : 500);
	}
}

async function directService() {
	servicePromise ??= import("../direct/chatgpt/DirectService.mjs")
		.then(module => module.directService);
	return servicePromise;
}

async function requestJson(req) {
	const text = (await readBody(req)).toString("utf8");
	return JSON.parse(text || "{}");
}

function publicError(error) {
	const message = String(error?.message || error || "Direct ChatGPT request failed.");
	const authentication = /authenticated|login|session|composer|socket/i.test(message);
	const expired = /expired|not found/i.test(message);
	return {
		ok: false,
		status: authentication
			? "direct_authentication_required"
			: expired
				? "direct_conversation_expired"
				: "direct_request_failed",
		error: authentication
			? "direct_authentication_required"
			: expired
				? "direct_conversation_expired"
				: "direct_request_failed",
		safeHint: authentication
			? "Open the relay's debug Chrome profile and authenticate ChatGPT manually."
			: expired
				? "Start a new direct conversation because the local continuation key expired."
				: "The direct request did not complete. Check relay health and retry after the pacing interval."
	};
}

module.exports = { handleDirectApi };
