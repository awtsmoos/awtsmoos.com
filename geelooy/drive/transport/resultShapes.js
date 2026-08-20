//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Transport response normalization for Geelooy Drive.
 * @description
 * The Awtsmoos may send one truth through several envelopes; Awtsmoos.com preserves scope, HTTP, retry, timeout, and cancellation testimony,
 * so a quiet superseded tap stays quiet while a real authorization or network failure remains precise enough to repair.
 */

export function assertTunnelSuccess(result, fallbackMessage = "Tunnel action failed.") {
	if (result && result.ok === false) {
		throw transportError(result, fallbackMessage);
	}
	return result;
}

export function transportError(result = {}, fallbackMessage = "Transport action failed.") {
	const code = String(result.error || result.code || "transport_error");
	const error = new Error(String(result.message || result.summary || code || fallbackMessage));
	error.code = code;
	error.neededScope = String(result.neededScope || "");
	error.identityKind = String(result.identityKind || "");
	error.httpStatus = Number(result.httpStatus || result.status || 0);
	error.retryable = result.retryable === true;
	error.aborted = result.aborted === true || code === "request_aborted";
	error.timeout = result.timeout === true || code === "request_timeout";
	error.details = result;
	if (code === "api_key_required" || code === "missing_scope") {
		error.userMessage = scopeMessage(error);
	}
	return error;
}

export function normalizeTunnelEntries(result) {
	assertTunnelSuccess(result, "Could not list this folder.");
	const items = result?.detailedItems || result?.items || result?.result?.items || [];
	return Array.isArray(items) ? items.map(normalizeEntry).filter(Boolean) : [];
}

export function tunnelTextContent(result) {
	assertTunnelSuccess(result, "Could not read this file.");
	const value = result?.content ?? result?.text ?? result?.data ?? result?.result?.content ?? "";
	return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function normalizePreviews(result) {
	assertTunnelSuccess(result, "Could not list published previews.");
	return Array.isArray(result?.previews) ? result.previews : [];
}

function normalizeEntry(item = {}) {
	const name = String(item.name || item.basename || item.label || "").trim();
	if (!name) return null;
	const rawType = String(item.type || item.kind || "").toLowerCase();
	const directory = item.isDirectory === true
		|| item.directory === true
		|| ["dir", "directory", "folder"].includes(rawType);
	return Object.freeze({
		name,
		type: directory ? "directory" : "file",
		size: Number(item.size || item.bytes || 0),
		modifiedAt: item.modifiedAt || item.mtime || item.mtimeMs || "",
		raw: item
	});
}

function scopeMessage(error) {
	return `This action needs a scoped API key${error.neededScope ? ` with ${error.neededScope}` : ""}. Load it in Access for this tab only.`;
}
