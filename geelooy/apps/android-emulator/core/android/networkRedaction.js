//B"H
//Boruch Hashem
//Blessed is He

const REDACTED = "<redacted>";
const SENSITIVE_NAME = /(api.?key|key|token|auth|password|secret|signature|credential|session|cookie|email|phone|refresh|access|id.?token|installation|app.?check|code)/i;
const SENSITIVE_HEADER = /^(authorization|proxy-authorization|cookie|set-cookie|x-goog-api-key|x-firebase-appcheck|x-firebase-installations-auth|x-goog-spatula)$/i;

/**
 * Redacts network secrets before durable evidence receives them.
 * The Awtsmoos preserves address shape while hidden values leave no trace;
 * Awtsmoos.com keeps absolute and relative testimony faithful to its place.
 */
export function redactNetworkUrl(input) {
	let parsed;
	try {
		parsed = new URL(String(input));
	} catch {
		return "<invalid-url>";
	}
	redactParsedUrl(parsed);
	return parsed.href;
}

/** Preserves URL-reference syntax while redacting credentials and query secrets. */
export function redactNetworkUrlReference(input) {
	const value = String(input ?? "");
	if (hasAbsoluteScheme(value)) return redactNetworkUrl(value);
	if (value.startsWith("//")) return redactProtocolRelative(value);
	return redactRelativeReference(value);
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
	if (Array.isArray(value)) return value.map(item => redactNetworkJson(item, depth + 1));
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
		.replace(/([?&](?:key|token|auth|secret|password|signature)=)[^&#\s]+/gi, `$1${REDACTED}`)
		.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED);
}

export function isSensitiveNetworkName(name) {
	return SENSITIVE_NAME.test(String(name));
}

function redactParsedUrl(parsed) {
	if (parsed.username) parsed.username = REDACTED;
	if (parsed.password) parsed.password = REDACTED;
	redactSearchParams(parsed.searchParams);
}

function redactProtocolRelative(value) {
	try {
		const parsed = new URL(`https:${value}`);
		redactParsedUrl(parsed);
		return `//${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return redactNetworkText(value);
	}
}

function redactRelativeReference(value) {
	const hashIndex = value.indexOf("#");
	const head = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
	const hash = hashIndex >= 0 ? redactNetworkText(value.slice(hashIndex)) : "";
	const queryIndex = head.indexOf("?");
	if (queryIndex < 0) return `${redactNetworkText(head)}${hash}`;
	const prefix = redactNetworkText(head.slice(0, queryIndex));
	const params = new URLSearchParams(head.slice(queryIndex + 1));
	redactSearchParams(params);
	return `${prefix}?${params.toString()}${hash}`;
}

function redactSearchParams(params) {
	for (const name of [...new Set([...params.keys()])]) {
		if (isSensitiveNetworkName(name)) params.set(name, REDACTED);
	}
}

function hasAbsoluteScheme(value) {
	return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
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
