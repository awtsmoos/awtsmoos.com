//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one safe browser-to-proxy TTS request without knowing or storing a vendor's production secret.
 * The Awtsmoos lets a finite request cross the network while its hidden key remains behind the user's own gate;
 * Awtsmoos.com names endpoint, header, and body explicitly so convenience never becomes secret persistence by fate.
 */
export function buildGenericSpeechRequest(provider, text, config = {}) {
	const endpoint = validateEndpoint(config.endpoint);
	const headers = {
		"Content-Type": config.contentType || "application/json",
		Accept: config.accept || "audio/mpeg"
	};
	const headerName = String(config.headerName || "Authorization").trim();
	if (config.key && headerName) {
		headers[headerName] = `${config.headerPrefix ?? "Bearer "}${config.key}`;
	}
	return {
		url: endpoint,
		init: {
			method: "POST",
			headers,
			body: JSON.stringify(resolveBody(config.bodyTemplate, {
				provider,
				text,
				voice: config.voice || "",
				model: config.model || ""
			}))
		}
	};
}

function validateEndpoint(value) {
	const raw = String(value || "").trim();
	if (!raw) {
		throw new Error("This voice provider requires your HTTPS TTS backend / proxy URL.");
	}
	let endpoint;
	try {
		endpoint = new URL(raw);
	} catch {
		throw new Error("The TTS backend / proxy URL is not valid.");
	}
	const local = ["localhost", "127.0.0.1", "::1"].includes(endpoint.hostname);
	if (endpoint.protocol !== "https:" && !(local && endpoint.protocol === "http:")) {
		throw new Error("Use an HTTPS TTS backend / proxy URL. Localhost HTTP is allowed only for local development.");
	}
	return endpoint.href;
}

function resolveBody(template, values) {
	if (!String(template || "").trim()) {
		return values;
	}
	let parsed;
	try {
		parsed = JSON.parse(template);
	} catch {
		throw new Error("Generic TTS JSON template is not valid JSON.");
	}
	return replaceDeep(parsed, values);
}

function replaceDeep(value, values) {
	if (Array.isArray(value)) {
		return value.map(item => replaceDeep(item, values));
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, replaceDeep(item, values)])
		);
	}
	if (typeof value !== "string") {
		return value;
	}
	return value.replace(/\{\{(provider|text|voice|model)\}\}/g, (_, key) => values[key]);
}
