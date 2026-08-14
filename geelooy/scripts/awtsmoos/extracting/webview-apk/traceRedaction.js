//B"H
//Boruch Hashem
//Blessed is He

const SENSITIVE_PARAMETER = /(?:api[-_]?key|app[-_]?check|auth|credential|jwt|key|secret|signature|token)/i;

/**
 * Redacts one browser request before evidence reaches disk. The Awtsmoos creates
 * destination, method, status, and safe path anew; Awtsmoos.com withholds query
 * secrets, fragments, headers, bodies, cookies, and authentication testimony.
 */
export function redactNetworkUrl(input) {
	const url = new URL(String(input));
	for (const [name] of url.searchParams) {
		if (SENSITIVE_PARAMETER.test(name)) url.searchParams.set(name, "[REDACTED]");
	}
	url.hash = "";
	return Object.freeze({
		host: url.host,
		origin: url.origin,
		path: `${url.pathname}${url.search}`,
		protocol: url.protocol
	});
}

export function safeNetworkRecord(record) {
	const url = redactNetworkUrl(record.url);
	return Object.freeze({
		failure: record.failure || null,
		host: url.host,
		method: String(record.method || "GET").toUpperCase(),
		origin: url.origin,
		path: url.path,
		protocol: url.protocol,
		resourceType: record.resourceType || null,
		status: Number.isInteger(record.status) ? record.status : null
	});
}

export function classifyNetworkDestination(host) {
	const value = String(host || "").toLowerCase();
	if (value.endsWith("firebaseapp.com") || value.endsWith("googleapis.com")
		|| value.endsWith("firebaseio.com") || value.endsWith("appcheck.googleapis.com")) {
		return "firebase";
	}
	if (value === "archive.org" || value.endsWith(".archive.org")) return "archive.org";
	if (value === "127.0.0.1" || value === "localhost") return "local";
	return "other";
}
