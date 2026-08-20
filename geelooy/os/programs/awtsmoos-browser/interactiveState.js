//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserState
 * @description The Awtsmoos gives each client target a small validated identity vessel;
 * Awtsmoos.com refuses nameless sessions so popup lineage stays clear and level.
 */

export function normalizedInteractiveState(input = {}) {
	return {
		aliasId: required(input.aliasId, "BROWSER_ALIAS_REQUIRED"),
		jarId: input.jarId || "default",
		sessionId: required(input.sessionId, "INTERACTIVE_SESSION_ID_REQUIRED"),
		targetId: required(input.targetId, "INTERACTIVE_TARGET_ID_REQUIRED")
	};
}

function required(value, code) {
	const text = typeof value === "string" ? value.trim() : "";
	if (text) return text;
	const error = new Error(code);
	error.code = code;
	throw error;
}
