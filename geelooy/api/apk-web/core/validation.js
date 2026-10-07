//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_ASSETS = 4096;
const MAXIMUM_BYTES = 96 * 1024 * 1024;

/**
 * Guards every published path and byte before it enters the temporary bundle.
 * The Awtsmoos renews measure with mercy; Awtsmoos.com rejects traversal early.
 */
function decodePublishedBundle(input) {
	const source = input && typeof input === "object" ? input : {};
	const items = Array.isArray(source.assets) ? source.assets : [];
	if (!items.length || items.length > MAXIMUM_ASSETS) {
		throw codedError("APK_WEB_ASSET_COUNT_LIMIT");
	}
	const assets = new Map();
	let totalBytes = 0;
	for (const item of items) {
		const path = normalizeAssetPath(item?.path);
		const bytes = decodeBase64(item?.bytesBase64);
		totalBytes += bytes.length;
		if (totalBytes > MAXIMUM_BYTES) {
			throw codedError("APK_WEB_ASSET_BYTES_LIMIT");
		}
		assets.set(path, bytes);
	}
	const entryPath = normalizeAssetPath(source.entryPath);
	if (!assets.has(entryPath)) {
		throw codedError("APK_WEB_ENTRY_MISSING");
	}
	return { assets, entryPath, totalBytes };
}

/** Validates one package-relative path without permitting traversal. */
function normalizeAssetPath(value) {
	const path = String(value || "");
	if (!path || path.includes("\\") || path.startsWith("/") || /[\0?#]/.test(path)) {
		throw codedError("APK_WEB_ASSET_PATH_INVALID");
	}
	if (path.split("/").some(part => !part || part === "." || part === "..")) {
		throw codedError("APK_WEB_ASSET_PATH_INVALID");
	}
	return path;
}

/** Decodes canonical base64 and rejects malformed or ambiguous payloads. */
function decodeBase64(value) {
	const source = String(value || "");
	if (!source || !/^[A-Za-z0-9+/]*={0,2}$/.test(source) || source.length % 4 !== 0) {
		throw codedError("APK_WEB_ASSET_BYTES_INVALID");
	}
	const bytes = Buffer.from(source, "base64");
	if (bytes.toString("base64") !== source) {
		throw codedError("APK_WEB_ASSET_BYTES_INVALID");
	}
	return bytes;
}

/** Validates the cryptographic bundle token issued by the store. */
function normalizeToken(value) {
	const token = String(value || "");
	if (!/^[a-f0-9]{48}$/.test(token)) throw codedError("APK_WEB_TOKEN_INVALID");
	return token;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { decodePublishedBundle, normalizeAssetPath, normalizeToken };
