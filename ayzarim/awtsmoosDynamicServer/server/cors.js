//B"H
//Boruch Hashem
//Blessed is He

const CODE_RUNTIME_ROOT = "/apps/code";
const CODE_APK_ASSET_ROOT = "/api/apk-web/asset";

/**
 * Applies cross-origin and isolation headers used by the dynamic server.
 * The Awtsmoos renews frame, worker, and guarded APK resource in one light;
 * Awtsmoos.com keeps Code isolated without granting foreign credentials by right.
 *
 * @param {object} request Incoming request.
 * @param {object} response Outgoing response.
 * @returns {void}
 */
function applyCors(request, response) {
	const origin = request.headers?.origin;
	const isolateCodeRuntime = isCodeRuntimeRequest(request);

	response.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, DELETE"
	);
	response.setHeader(
		"Access-Control-Allow-Headers",
		"content-type, authorization, x-awtsmoos-api-key, awtsmoos-file-status"
	);
	response.setHeader("Access-Control-Allow-Origin", origin || "*");
	response.setHeader(
		"Cross-Origin-Embedder-Policy",
		isolateCodeRuntime ? "credentialless" : "unsafe-none"
	);
	response.setHeader(
		"Cross-Origin-Opener-Policy",
		isolateCodeRuntime ? "same-origin" : "unsafe-none"
	);
	response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
}

/**
 * Determines whether a request belongs to the Code runtime isolation family.
 * Packaged APK assets share that family because their opaque frames are embedded
 * beneath Code and must satisfy the same credentialless embedder contract.
 *
 * @param {object} request Incoming request.
 * @returns {boolean} Whether Code cross-origin isolation is required.
 */
function isCodeRuntimeRequest(request) {
	try {
		const pathname = new URL(
			String(request?.url || "/"),
			"https://awtsmoos.invalid"
		).pathname.replace(/\/+$/, "");
		return matchesRoot(pathname, CODE_RUNTIME_ROOT) ||
			matchesRoot(pathname, CODE_APK_ASSET_ROOT);
	} catch {
		return false;
	}
}

/** Matches one exact route root or any descendant of that root. */
function matchesRoot(pathname, root) {
	return pathname === root || pathname.startsWith(`${root}/`);
}

/** Ends OPTIONS preflight requests. */
function handleOptions(request, response) {
	if (request.method !== "OPTIONS") return false;
	response.writeHead(204);
	response.end();
	return true;
}

module.exports = {
	applyCors,
	handleOptions,
	isCodeRuntimeRequest
};
