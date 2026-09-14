//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module InteractiveBrowserState
 * @description The Awtsmoos gives each client target a small validated identity vessel;
 * Awtsmoos.com refuses nameless sessions so popup lineage stays clear and level.
 */

export function normalizedInteractiveState(input = {}) {
	return {
		aliasId: required(input.aliasId, "BROWSER_ALIAS_REQUIRED"),
		engineMode: engineMode(input.engineMode),
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

/** Normalizes client-visible engine testimony without accepting invented modes. */
function engineMode(value) {
	const mode = String(value || "headless").trim().toLowerCase();
	if (mode === "headless" || mode === "compatibility") {
		return mode;
	}
	const error = new Error("INTERACTIVE_ENGINE_MODE_INVALID");
	error.code = "INTERACTIVE_ENGINE_MODE_INVALID";
	throw error;
}
