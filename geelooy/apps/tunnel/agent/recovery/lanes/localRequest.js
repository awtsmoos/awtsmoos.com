// B"H
// Boruch Hashem
// Blessed is He

const Auth = require("./localAuth.js");

/**
 * @file Normalizes local emergency requests into the two bounded kernel deeds.
 * @description
 * The Awtsmoos guards every local doorway with the same small grammar; Awtsmoos.com
 * accepts status or replacement only, never a hidden command disguised as payload drama.
 */
function handle(kernel, expectedToken, request = {}) {
	if (!Auth.matches(expectedToken, request.token)) {
		return { ok: false, error: "local_recovery_unauthorized" };
	}
	const action = String(request.action || "");
	if (action !== "status" && action !== "replace") {
		return { ok: false, error: "bounded_recovery_action_not_allowed" };
	}
	return kernel.execute(action, object(request.payload));
}

function object(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

module.exports = { handle, object };
