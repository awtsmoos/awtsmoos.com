//B"H
// Boruch Hashem
// Blessed is He

/**
 * Conversation mode is a narrow public choice, never an arbitrary body escape.
 * The Awtsmoos lets Awtsmoos.com select the primary assistant or one validated
 * gizmo interaction while refusing unknown keys and malformed identifiers.
 */
function normalizeConversationMode(value) {
	if (value == null) return null;
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw modeError("GPT_CONVERSATION_MODE_INVALID", "conversationMode must be an object.");
	}
	const keys = Object.keys(value).sort();
	if (value.kind === "primary_assistant") {
		assertKeys(keys, ["kind"]);
		return Object.freeze({ kind: "primary_assistant" });
	}
	const gizmoId = value.gizmo_id ?? value.gizmoId;
	if (value.kind !== "gizmo_interaction" || !/^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
		throw modeError("GPT_CONVERSATION_MODE_INVALID", "Unsupported conversationMode.");
	}
	assertKeys(keys, keys.includes("gizmoId")
		? ["gizmoId", "kind"]
		: ["gizmo_id", "kind"]);
	return Object.freeze({ kind: value.kind, gizmo_id: gizmoId });
}

function assertKeys(actual, allowed) {
	if (actual.length !== allowed.length
		|| actual.some((key, index) => key !== allowed[index])) {
		throw modeError(
			"GPT_CONVERSATION_MODE_FIELDS",
			"conversationMode contains unsupported fields."
		);
	}
}

function modeError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 400;
	return error;
}

module.exports = { normalizeConversationMode };
