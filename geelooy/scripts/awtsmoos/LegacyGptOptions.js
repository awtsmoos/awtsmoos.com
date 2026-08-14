//B"H
// Boruch Hashem
// Blessed is He

const FORBIDDEN_GO_FIELDS = new Set([
	"authorizationToken",
	"arkoseToken",
	"proofToken",
	"turnstileToken",
	"chatRequirementsToken",
	"customHeaders",
	"headers",
	"cookie",
	"cookies",
	"more",
	"customFetch"
]);

/**
 * The old surface offered limitless fields; this Awtsmoos.com vessel preserves
 * only prompt, callbacks, opaque continuation, model, thinking, and a validated
 * conversation mode. The Awtsmoos closes every credential and arbitrary-header gate.
 */
export function normalizeLegacyGoOptions(options = {}) {
	for (const field of Object.keys(options)) {
		if (FORBIDDEN_GO_FIELDS.has(field)) {
			throw optionError(
				"LEGACY_GPT_CREDENTIAL_FIELD_FORBIDDEN",
				`Legacy GPT field '${field}' is no longer accepted.`
			);
		}
	}
	if (options.parentMessageId || options.parent_message_id) {
		throw optionError(
			"LEGACY_GPT_PARENT_ID_UNSUPPORTED",
			"Use the opaque conversation key; raw parent message ids are not accepted."
		);
	}
	return {
		prompt: options.prompt,
		onstream: options.onstream,
		ondone: options.ondone,
		mode: options.mode ?? "page-authorized-fallback",
		model: optionalString(options.model, 120),
		thinkingEffort: optionalString(
			options.thinkingEffort ?? options.thinking_effort,
			40
		),
		conversationMode: normalizeConversationMode(
			options.conversationMode ?? options.conversation_mode
		),
		callbackStyle: options.callbackStyle ?? "legacy-data",
		conversation_id: normalizeConversationKey(
			options.conversation_id ?? options.conversationId
		)
	};
}

export function normalizeConversationMode(value) {
	if (value == null) return null;
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw optionError("LEGACY_GPT_MODE_INVALID", "conversationMode must be an object.");
	}
	const kind = value.kind;
	if (kind === "primary_assistant") return { kind };
	const gizmoId = value.gizmo_id ?? value.gizmoId;
	if (kind !== "gizmo_interaction" || !/^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
		throw optionError("LEGACY_GPT_MODE_INVALID", "Unsupported conversation mode.");
	}
	return { kind, gizmo_id: gizmoId };
}

export function normalizeConversationKey(value) {
	if (value == null || value === "") return null;
	if (typeof value === "string" && value.startsWith("BH_DIRECT_")) return value;
	throw optionError(
		"LEGACY_GPT_RAW_CONVERSATION_ID_UNSUPPORTED",
		"Raw ChatGPT conversation ids were replaced by opaque BH_DIRECT_ keys."
	);
}

function optionalString(value, maximumLength) {
	if (value == null || value === "") return null;
	if (typeof value !== "string" || value.length > maximumLength) {
		throw optionError("LEGACY_GPT_FIELD_INVALID", "Legacy GPT text option is invalid.");
	}
	return value;
}

function optionError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
