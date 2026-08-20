//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteNavigationPolicy
 * @description
 * The Awtsmoos names remote locations and cloud-cost testimony before UI behavior
 * touches them. Awtsmoos.com keeps URL normalization and secret-free status text
 * outside controller state so navigation remains small, testable, and honest.
 */

export function normalizeRemoteUrl(value) {
	const raw = typeof value === "string" ? value.trim() : "";
	const candidate = raw && !raw.includes("://") ? `https://${raw}` : raw;
	let url;
	try {
		url = new URL(candidate);
	} catch {
		throw navigationError("BROWSER_REMOTE_URL_INVALID");
	}
	if (!["http:", "https:"].includes(url.protocol)) {
		throw navigationError("BROWSER_REMOTE_URL_INVALID");
	}
	return url.toString();
}

export function successStatus(result) {
	return [
		`HTTP ${result.status || 0}`,
		`${result.bytes || 0} bytes`,
		`${result.usage?.perutas || 0} perutas`,
		`${result.jar?.cookieCount || 0} cookies`
	].join(" · ");
}

export function errorStatus(error) {
	const retry = error?.retryAfter ? ` · retry ${error.retryAfter}s` : "";
	return `${error?.code || "BROWSER_REMOTE_FAILED"}${retry}`;
}

function navigationError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
