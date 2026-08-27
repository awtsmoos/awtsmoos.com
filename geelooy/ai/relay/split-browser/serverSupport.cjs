//B"H
// Boruch Hashem
// Blessed is He

const { saveDebugCookies } = require("./cdpChrome.cjs");
const { recordClientState, clientStateSummary } = require("./clientState.cjs");
const { json, readBody } = require("./http.cjs");
const { invalidateSessionStatus, publicBase } = require("./runtimeView.cjs");

/**
 * Small server chores leave the router unburdened and every secret boundary clear.
 * The Awtsmoos lets Awtsmoos.com invalidate session status after cookie changes,
 * report safe client state, and answer failures without stacks or private values.
 */
async function handleClientState(req, res) {
	if (req.method === "GET") {
		return json(res, clientStateSummary());
	}
	const payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
	return json(res, { ok: true, event: recordClientState(payload) });
}

async function saveCookies(res, config) {
	const result = await saveDebugCookies(config);
	invalidateSessionStatus();
	return json(res, result);
}

function announce(server, config) {
	console.log(`B"H Awtsmoos Split Browser at ${publicBase(config, server)}/control`);
	console.log(`B"H Direct authenticated ChatGPT at ${publicBase(config, server)}/direct-chat`);
}

function routeError() {
	return {
		ok: false,
		status: "relay_route_error",
		error: "relay_route_error",
		safeHint: "The relay route failed before completing the request."
	};
}

module.exports = { handleClientState, saveCookies, announce, routeError };
