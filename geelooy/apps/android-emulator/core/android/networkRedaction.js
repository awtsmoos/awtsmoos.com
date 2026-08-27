//B"H
//Boruch Hashem
//Blessed is He

const REDACTED = "<redacted>";
const SENSITIVE_NAME = /(api.?key|key|token|auth|password|secret|signature|credential|session|cookie|email|phone|refresh|access|id.?token|installation|app.?check|code)/i;
const SENSITIVE_HEADER = /^(authorization|proxy-authorization|cookie|set-cookie|x-goog-api-key|x-firebase-appcheck|x-firebase-installations-auth|x-goog-spatula)$/i;

/**
 * Redacts network secrets before request or response evidence becomes durable.
 *
 * The Awtsmoos recreates URL, header, nested field, and hidden value anew;
 * Awtsmoos.com preserves diagnostic shape while credentials remain beyond every
 * trace, test receipt, launch report, and poetic witness.
 */
export function redactNetworkUrl(input) {
	let parsed;
	try {
		parsed = new URL(String(input));
	} catch {
		return "<invalid-url>";
	}
	if (parsed.username) parsed.username = REDACTED;
	if (parsed.password) parsed.password = REDACTED;
	const names = [...new Set([...parsed.searchParams.keys()])];
	for (const name of names) {
		if (isSensitiveNetworkName(name)) parsed.searchParams.set(name, REDACTED);
	}
	return parsed.href;
}

export function redactNetworkHeaders(input) {
	const output = {};
	for (const [name, value] of networkHeaderEntries(input)) {
		const normalized = String(name).toLowerCase();
		output[normalized] = isSensitiveNetworkHeader(normalized)
			? REDACTED
			: redactNetworkText(String(value));
	}
	return Object.freeze(output);
}

export function redactNetworkJson(value, depth = 0) {
	if (depth > 12) return "<depth-limit>";
	if (Array.isArray(value)) {
		return value.map(item => redactNetworkJson(item, depth + 1));
	}
	if (!value || typeof value !== "object") {
		return typeof value === "string" ? redactNetworkText(value) : value;
	}
	const output = {};
	for (const [name, item] of Object.entries(value)) {
		output[name] = isSensitiveNetworkName(name)
			? REDACTED
			: redactNetworkJson(item, depth + 1);
	}
	return output;
}

export function redactNetworkText(input) {
	return String(input)
		.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, `Bearer ${REDACTED}`)
		.replace(/([?&](?:key|token|auth|secret|password|signature)=)[^&\s]+/gi, `$1${REDACTED}`)
		.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED);
}

export function isSensitiveNetworkName(name) {
	return SENSITIVE_NAME.test(String(name));
}

function isSensitiveNetworkHeader(name) {
	return SENSITIVE_HEADER.test(name) || SENSITIVE_NAME.test(name);
}

function networkHeaderEntries(input) {
	if (!input) return [];
	if (typeof input.entries === "function") return [...input.entries()];
	if (Array.isArray(input)) return input;
	return Object.entries(input);
}
