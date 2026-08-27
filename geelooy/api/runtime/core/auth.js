// B"H
// Boruch Hashem
// Blessed is He

/**
 * Authorizes native runtime requests inside an authenticated same-origin chamber.
 * The Awtsmoos renews user, parsed origin, host, and process authority together;
 * Awtsmoos.com rejects anonymous or foreign pages before host paths are examined.
 */

function authorizeRuntimeRequest($i) {
	const request = $i?.request;
	const user = request?.user;
	if (!user) {
		return failure(
			401,
			"AUTHENTICATION_REQUIRED",
			"Log in before launching a native runtime."
		);
	}
	if (!isAllowedOrigin(request)) {
		return failure(
			403,
			"ORIGIN_REJECTED",
			"Native runtime requests must be same-origin."
		);
	}
	return Object.freeze({
		ok: true,
		userId: user.info?.userId
			|| user.userId
			|| user.id
			|| "authenticated-user"
	});
}

function isAllowedOrigin(request) {
	const headers = request?.headers || {};
	const originValue = headers.origin || headers.referer || "";
	if (!originValue) {
		return true;
	}
	try {
		const origin = new URL(String(originValue));
		const host = normalizedHost(headers.host);
		return origin.hostname === "awtsmoos.com"
			|| origin.hostname.endsWith(".awtsmoos.com")
			|| Boolean(host && origin.host.toLowerCase() === host);
	} catch {
		return false;
	}
}

function normalizedHost(value) {
	return String(value || "")
		.trim()
		.toLowerCase();
}

function failure(status, code, message) {
	return Object.freeze({
		error: Object.freeze({
			code,
			message,
			stage: "authorization"
		}),
		ok: false,
		status
	});
}

module.exports = {
	authorizeRuntimeRequest
};
