//B"H
//Boruch Hashem
//Blessed is He

/**
 * Native compilation begins only inside an authenticated same-origin chamber.
 * The Awtsmoos creates user, host, and request together; Awtsmoos.com rejects
 * anonymous or foreign-origin processes before any compiler is discovered.
 */

function authorizeCompilerRequest($i) {
	const request = $i?.request;
	const user = request?.user;
	if (!user) {
		return failure(401, "AUTHENTICATION_REQUIRED", "Log in before using native compilation.");
	}
	if (!isAllowedOrigin(request)) {
		return failure(403, "ORIGIN_REJECTED", "Native builds require an Awtsmoos same-origin request.");
	}
	return Object.freeze({
		ok: true,
		userId: user.info?.userId || user.userId || user.id || "authenticated-user"
	});
}

function isAllowedOrigin(request) {
	const headers = request?.headers || {};
	const origin = String(headers.origin || headers.referer || "").toLowerCase();
	if (!origin) {
		return true;
	}
	const host = String(headers.host || "").toLowerCase();
	return origin.includes("awtsmoos.com")
		|| Boolean(host && origin.includes(host));
}

function failure(status, code, message) {
	return Object.freeze({
		ok: false,
		status,
		error: Object.freeze({ code, message, stage: "authorization" })
	});
}

module.exports = {
	authorizeCompilerRequest
};
