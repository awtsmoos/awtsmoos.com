//B"H
// Boruch Hashem
// Blessed is He

const { normalizeConversationMode } = require("./conversationMode.js");

const REQUEST_BYTES = 64 * 1024;
const ACTIONS = new Set(["health", "capability", "chat", "reset"]);
const MODES = new Set(["strict-request-only", "page-authorized-fallback"]);
const FORBIDDEN_FIELDS = new Set([
	"authorizationToken", "arkoseToken", "proofToken",
	"turnstileToken", "chatRequirementsToken", "customHeaders",
	"headers", "cookies", "cookie", "token", "more"
]);

/**
 * Old AwtsmoosGPTify accepted a wide request object; the modern Awtsmoos.com API
 * preserves useful state, model, thinking, and validated conversation mode while
 * refusing credentials, arbitrary headers, proof values, and extension bags.
 */
function parseGptRequest($i, {
	defaultAction = "capability",
	defaultMode = "strict-request-only"
} = {}) {
	const input = parseInput($i?.$_POST);
	for (const field of Object.keys(input)) {
		if (FORBIDDEN_FIELDS.has(field)) {
			throw requestError("GPT_CREDENTIAL_FIELD_FORBIDDEN", `Field '${field}' is not accepted.`);
		}
	}
	const action = cleanString(input.action || $i?.$_GET?.action || defaultAction, 32);
	if (!ACTIONS.has(action)) {
		throw requestError("GPT_ACTION_INVALID", `Unsupported GPT action: ${action}.`);
	}
	const parsed = { action };
	if (action === "chat") {
		parsed.prompt = cleanRequiredString(input.prompt, "prompt", 48000);
		parsed.mode = cleanString(input.mode || defaultMode, 48);
		if (!MODES.has(parsed.mode)) {
			throw requestError("GPT_MODE_INVALID", `Unsupported GPT mode: ${parsed.mode}.`);
		}
		parsed.conversationKey = optionalConversationKey(input.conversationKey);
		parsed.model = optionalString(input.model, 120);
		parsed.thinkingEffort = optionalString(input.thinkingEffort, 40);
		parsed.conversationMode = normalizeConversationMode(input.conversationMode);
	}
	if (action === "reset") {
		parsed.conversationKey = optionalConversationKey(input.conversationKey);
	}
	return Object.freeze(parsed);
}

function parseInput(input) {
	if (!input) return {};
	if (!input.__raw_body__) return input;
	const bytes = Buffer.isBuffer(input.__raw_body__)
		? input.__raw_body__
		: Buffer.from(input.__raw_body__);
	if (bytes.length > REQUEST_BYTES) {
		throw requestError("GPT_REQUEST_LIMIT", "GPT request exceeds 64 KiB.");
	}
	try {
		return JSON.parse(bytes.toString("utf8"));
	} catch {
		throw requestError("GPT_JSON_INVALID", "GPT request body is not valid JSON.");
	}
}

function optionalConversationKey(value) {
	if (value == null || value === "") return null;
	const key = cleanString(value, 180);
	if (!key.startsWith("BH_DIRECT_")) {
		throw requestError("GPT_CONVERSATION_KEY_INVALID", "Use an opaque BH_DIRECT_ conversation key.");
	}
	return key;
}

function cleanRequiredString(value, name, limit) {
	const result = cleanString(value, limit);
	if (!result) throw requestError("GPT_FIELD_REQUIRED", `${name} is required.`);
	return result;
}

function optionalString(value, limit) {
	return value == null || value === "" ? null : cleanString(value, limit);
}

function cleanString(value, limit) {
	if (typeof value !== "string") {
		throw requestError("GPT_FIELD_TYPE", "GPT text fields must be strings.");
	}
	const result = value.trim();
	if (result.length > limit) throw requestError("GPT_FIELD_LIMIT", `GPT field exceeds ${limit} characters.`);
	return result;
}

function requestError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 400;
	return error;
}

module.exports = { parseGptRequest, REQUEST_BYTES, ACTIONS, MODES };
