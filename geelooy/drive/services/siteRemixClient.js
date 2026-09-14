//B"H
//Boruch Hashem
//Blessed be He

const REMIX_SUFFIX = "__awtsmoos/remix.json";
const MAX_FILES = 120;
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Reads the remix source requested by the Builder URL and discovers its public
 * manifest without trusting cross-origin input or guessing named-site identity.
 */
export async function fetchSiteRemix(sourceValue, options = {}) {
	const location = options.location || globalThis.location;
	const fetchImpl = options.fetchImpl || globalThis.fetch;
	const source = normalizeRemixSource(sourceValue, location);
	let lastError = null;
	for (const candidate of remixManifestCandidates(source.pathname)) {
		try {
			const response = await fetchImpl(candidate, {
				credentials: "omit",
				cache: "no-store",
				headers: { Accept: "application/json" }
			});
			const payload = await response.json().catch(() => null);
			if (response.ok && payload?.ok === true) {
				return validateRemixManifest(payload.manifest);
			}
			if (payload?.error === "REMIX_BINARY_ASSETS_UNSUPPORTED") {
				throw remixClientError(payload.error, payload.paths);
			}
			lastError = payload?.error || `remix_http_${response.status}`;
		} catch (error) {
			if (error?.code === "REMIX_BINARY_ASSETS_UNSUPPORTED") throw error;
			lastError = error?.code || error?.message || "remix_fetch_failed";
		}
	}
	throw remixClientError("REMIX_MANIFEST_NOT_FOUND", lastError);
}

/** Accepts only a same-origin public Awtsmoos Site URL. */
export function normalizeRemixSource(value, locationLike = globalThis.location) {
	const base = locationLike?.origin || "http://localhost";
	let url;
	try {
		url = new URL(String(value || ""), base);
	} catch {
		throw remixClientError("REMIX_SOURCE_INVALID");
	}
	if (url.origin !== base || !url.pathname.startsWith("/sites/")) {
		throw remixClientError("REMIX_SOURCE_INVALID");
	}
	return url;
}

/** Walks from the viewed path toward the alias root until the Site identity answers. */
export function remixManifestCandidates(pathname) {
	const segments = String(pathname || "").split("/").filter(Boolean);
	if (segments[0] !== "sites" || segments.length < 2) return [];
	const candidates = [];
	const deepest = Math.min(segments.length, 14);
	for (let count = deepest; count >= 2; count -= 1) {
		const root = `/${segments.slice(0, count).map(encodeSegment).join("/")}/`;
		candidates.push(`${root}${REMIX_SUFFIX}`);
	}
	return candidates;
}

/** Validates the complete server testimony before any local mutation begins. */
export function validateRemixManifest(manifest) {
	if (manifest?.kind !== "awtsmoos-site-remix" || manifest?.version !== 1) {
		throw remixClientError("REMIX_MANIFEST_INVALID");
	}
	const files = Array.isArray(manifest.files) ? manifest.files : [];
	if (!files.length || files.length > MAX_FILES) throw remixClientError("REMIX_FILE_COUNT_INVALID");
	let bytes = 0;
	const paths = new Set();
	for (const file of files) {
		if (!safeRelativePath(file?.path) || typeof file?.content !== "string") {
			throw remixClientError("REMIX_FILE_INVALID");
		}
		if (paths.has(file.path)) throw remixClientError("REMIX_DUPLICATE_PATH");
		paths.add(file.path);
		bytes += new TextEncoder().encode(file.content).length;
	}
	if (bytes > MAX_BYTES || !paths.has("index.html")) throw remixClientError("REMIX_MANIFEST_INVALID");
	return Object.freeze({ ...manifest, files: Object.freeze(files.map(file => Object.freeze({ ...file }))) });
}

function safeRelativePath(value) {
	const path = String(value || "");
	if (!path || path.startsWith("/") || path.includes("\\")) return false;
	return path.split("/").every(segment => segment && segment !== "." && segment !== "..");
}

function encodeSegment(value) {
	return encodeURIComponent(decodeURIComponent(value));
}

function remixClientError(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}
