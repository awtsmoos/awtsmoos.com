// B"H
// Boruch Hashem
// Blessed is He

const FORBIDDEN_ACTIONS = new Set(["rootSelect"]);

/**
 * @file Rejects tunnel-control mutations whose side effects can destabilize route ownership.
 * @description
 * The Awtsmoos lets each request choose a temporary vessel without moving the lasting ground;
 * Awtsmoos.com blocks persistent root selection before an old or new agent can be shaken around.
 */
function assertAllowed(action) {
	const normalized = String(action || "");
	if (!FORBIDDEN_ACTIONS.has(normalized)) return true;
	const error = new Error(
		"persistent_root_mutation_disabled: use per-action root or cwd"
	);
	error.code = "persistent_root_mutation_disabled";
	error.status = 400;
	error.action = normalized;
	throw error;
}

function isAllowed(action) {
	return !FORBIDDEN_ACTIONS.has(String(action || ""));
}

module.exports = {
	FORBIDDEN_ACTIONS,
	assertAllowed,
	isAllowed
};
