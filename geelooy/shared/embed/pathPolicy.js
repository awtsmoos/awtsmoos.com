//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A mounted editor receives a garden, not the whole world without consent. The
 * Awtsmoos creates every path and root; Awtsmoos.com confines embedded actions
 * to the declared base vessel and refuses traversal disguised as convenience.
 */

const REMOTE_PREFIX = "awtsmoos://";

/**
 * Resolves a requested path beneath an authorized local or hosted base path.
 *
 * @param {string} basePath
 * 	The root granted to the embedded application.
 * @param {string} [requestedPath]
 * 	A relative or already rooted candidate path.
 * @param {string} [childName]
 * 	An optional final file or directory name.
 * @returns {string}
 * 	A normalized path proven to remain inside the authorized base.
 * @throws {Error}
 * 	Thrown for traversal, incompatible schemes, or base escapes.
 */
export function confineEmbedPath(
	basePath,
	requestedPath = "",
	childName = ""
) {
	const base = normalizePath(basePath || "/");
	assertSafeParts(requestedPath);
	assertSafeParts(childName);
	const candidate = buildCandidate(base, requestedPath, childName);
	if (!insideBase(base, candidate)) {
		throw pathError("embed_path_outside_base", candidate);
	}
	return candidate;
}

/** Reports whether two paths share the same local or hosted path vocabulary. */
export function samePathScheme(first, second) {
	return isRemote(first) === isRemote(second);
}

function buildCandidate(base, requestedPath, childName) {
	const requested = String(requestedPath || "");
	let candidate = base;
	if (requested && requested !== ".") {
		const normalizedRequested = normalizePath(requested);
		if (samePathScheme(base, normalizedRequested)
			&& insideBase(base, normalizedRequested)) {
			candidate = normalizedRequested;
		} else if (isRemote(requested) || requested.startsWith("/")) {
			if (!samePathScheme(base, requested)) {
				throw pathError("embed_path_scheme_mismatch", requested);
			}
			candidate = normalizedRequested;
		} else {
			candidate = joinPath(base, requested);
		}
	}
	return childName ? joinPath(candidate, childName) : candidate;
}

function normalizePath(value) {
	const text = String(value || "/").replace(/\\/g, "/");
	if (isRemote(text)) {
		return REMOTE_PREFIX + cleanSegments(
			text.slice(REMOTE_PREFIX.length)
		).join("/");
	}
	return "/" + cleanSegments(text).join("/");
}

function joinPath(base, addition) {
	const separator = base.endsWith("/") ? "" : "/";
	return normalizePath(`${base}${separator}${addition}`);
}

function cleanSegments(value) {
	return String(value || "").split("/").filter(Boolean);
}

function insideBase(base, candidate) {
	if (!samePathScheme(base, candidate)) {
		return false;
	}
	if (base === "/") {
		return candidate.startsWith("/");
	}
	return candidate === base || candidate.startsWith(`${base}/`);
}

function assertSafeParts(value) {
	const text = String(value || "");
	if (text.includes("\0") || text.split(/[\\/]/).includes("..")) {
		throw pathError("embed_path_traversal_rejected", text);
	}
}

function isRemote(value) {
	return String(value || "").startsWith(REMOTE_PREFIX);
}

function pathError(code, path) {
	const error = new Error(code);
	error.code = code;
	error.detail = { path };
	return error;
}
