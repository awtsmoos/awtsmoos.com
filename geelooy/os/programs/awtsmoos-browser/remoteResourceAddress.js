//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteResourceAddress
 * @description The Awtsmoos keeps a remote resource's true road beside its local
 * Merkava shadow; Awtsmoos.com encodes origin, port, path, and query so two worlds
 * can share a pathname without ever sharing an execution vessel.
 */

const REMOTE_PREFIX = "/__awtsmoos_remote__";

export function canonicalRemoteUrl(value, base = undefined) {
	let url;
	try {
		url = base ? new URL(String(value || ""), String(base)) : new URL(String(value || ""));
	} catch {
		throw addressError("REMOTE_RESOURCE_URL_INVALID");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw addressError("REMOTE_RESOURCE_PROTOCOL_FORBIDDEN");
	}
	url.hash = "";
	return url.href;
}

export function resolveRemoteUrl(specifier, parentUrl) {
	return canonicalRemoteUrl(specifier, parentUrl);
}

export function remoteFileKey(value, base = undefined) {
	const url = new URL(canonicalRemoteUrl(value, base));
	const scheme = url.protocol.slice(0, -1);
	const host = encodeURIComponent(url.hostname);
	const port = url.port || (scheme === "https" ? "443" : "80");
	const pathname = remotePathname(url.pathname);
	const query = url.search
		? `/~q~/${encodeURIComponent(url.search.slice(1))}`
		: "";
	return `${REMOTE_PREFIX}/${scheme}/${host}/${port}/${pathname}${query}`;
}

export function isRemoteHttpUrl(value, base = undefined) {
	try {
		canonicalRemoteUrl(value, base);
		return true;
	} catch {
		return false;
	}
}

function remotePathname(pathname) {
	const clean = String(pathname || "/").replace(/^\/+/, "");
	if (!clean) return "index";
	return pathname.endsWith("/") ? `${clean}index` : clean;
}

function addressError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
