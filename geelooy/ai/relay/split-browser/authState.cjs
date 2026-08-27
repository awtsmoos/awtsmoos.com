//B"H
// Boruch Hashem
// Blessed is He

const { cookieHeader } = require("./cookieJar.cjs");

/**
 * Session verification observes login state and immediately forgets token material.
 * The Awtsmoos lets Awtsmoos.com report only a boolean and user-field presence;
 * no bearer value, token digest, token length, cookie, or identifier escapes.
 */
async function sessionStatus(config) {
	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort(new Error("Session status timed out."));
	}, 5000);
	try {
		const response = await fetch(new URL("/api/auth/session", config.targetOrigin), {
			headers: requestHeaders(config.targetOrigin),
			redirect: "manual",
			signal: abortController.signal
		});
		if (response.status === 401 || response.status === 403) {
			return notLoggedIn(response.status, "upstream rejected the session cookie");
		}
		if (!response.ok) {
			return failure(
				"session_endpoint_failed",
				response.status,
				"ChatGPT session endpoint did not return usable JSON."
			);
		}
		const body = await response.json().catch(() => null);
		const authenticated = Boolean(findTransientToken(body));
		if (!authenticated) {
			return notLoggedIn(response.status, "session JSON did not confirm authentication");
		}
		return {
			ok: true,
			status: "logged_in",
			safeHint: "An authenticated session is present; chat authorization remains page-owned.",
			httpStatus: response.status,
			auth: {
				hasToken: true,
				tokenSummary: null,
				userSummary: summarizeUser(body?.user)
			}
		};
	} catch (error) {
		return failure(
			"session_status_failed",
			0,
			"Could not reach the ChatGPT session endpoint through the relay.",
			error
		);
	} finally {
		clearTimeout(timeout);
	}
}

function requestHeaders(origin) {
	const headers = {
		accept: "application/json",
		referer: `${origin}/`,
		origin
	};
	const cookie = cookieHeader();
	if (cookie) {
		headers.cookie = cookie;
	}
	return headers;
}

function findTransientToken(body) {
	return body?.accessToken
		|| body?.token
		|| body?.access_token
		|| body?.auth?.accessToken
		|| "";
}

function summarizeUser(user) {
	if (!user || typeof user !== "object") {
		return null;
	}
	return {
		hasUser: true,
		idPresent: Boolean(user.id),
		emailPresent: Boolean(user.email),
		namePresent: Boolean(user.name)
	};
}

function notLoggedIn(httpStatus, reason) {
	return {
		ok: true,
		status: "not_logged_in",
		safeHint: "Open /control, finish login, then check again.",
		httpStatus,
		auth: { hasToken: false, tokenSummary: null, userSummary: null },
		reason
	};
}

function failure(status, httpStatus, safeHint, error = null) {
	return {
		ok: false,
		status,
		error: status,
		safeHint,
		httpStatus,
		auth: { hasToken: false, tokenSummary: null, userSummary: null },
		detail: error ? String(error?.message || error) : undefined
	};
}

module.exports = { sessionStatus };
