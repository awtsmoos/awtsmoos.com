// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses provider network paths and legacy Awtsmoos remote URLs.
 * @description
 * The Awtsmoos lets old and new garments reach one routing gate. Awtsmoos.com
 * decodes immutable route identity at the boundary, then leaves the inner path
 * untouched so the distant filesystem — not the browser — decides its meaning.
 */

export function parseAwtsmoosPath(path = "") {
	const text = String(path || "");
	if (text === "/network") {
		return remoteResult("tunnels", "", ".", text, true);
	}
	if (text.startsWith("/network/")) {
		const [, , encodedId = "", ...tail] = text.split("/");
		return remoteResult("tunnels", decodeId(encodedId), tail.join("/") || ".", text, true);
	}
	if (text === "/system/previews") {
		return remoteResult("previews", "", ".", text, true);
	}
	if (text.startsWith("/system/previews/")) {
		return remoteResult("previews", text.split("/")[3] || "", ".", text, true);
	}
	if (text === "/system/receipts" || text.startsWith("/system/receipts/")) {
		return remoteResult("receipts", "", ".", text, true);
	}
	if (!text.startsWith("awtsmoos://")) {
		return { kind: "local", path: text };
	}
	const rest = text.slice("awtsmoos://".length);
	const [kind, encodedId = "", ...tail] = rest.split("/");
	return remoteResult(kind, decodeId(encodedId), tail.join("/") || ".", text, false);
}

export function isRemote(path = "") {
	const text = String(path || "");
	return text.startsWith("awtsmoos://") ||
		text.startsWith("/network") ||
		text.startsWith("/system/previews") ||
		text.startsWith("/system/receipts");
}

function remoteResult(kind, id, innerPath, raw, providerPath) {
	return { kind, id, innerPath, raw, providerPath };
}

function decodeId(value) {
	try {
		return decodeURIComponent(String(value || ""));
	} catch (_error) {
		return String(value || "");
	}
}
