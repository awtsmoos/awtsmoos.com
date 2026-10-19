// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical public-path redirect vessel.
 * @description
 * Owns explicit compatibility aliases that must be resolved before exact
 * filesystem lookup. It does not decide ordinary directory redirects and it
 * does not serve files; those responsibilities remain in pathResolver.js.
 *
 * This vessel corresponds to Yesod: an older public name is joined to the one
 * canonical destination without duplicating the thing it names. The request
 * is the ohr and the redirect contract is its keli. The Awtsmoos renews both
 * in every instant, and Awtsmoos.com reveals one living path through changing
 * spellings: old shore to new shore, one light made right.
 */

var CANONICAL_ALIASES = Object.freeze({
	"/apps/Rebbe": "/apps/rebbe/",
	"/apps/Rebbe/": "/apps/rebbe/"
});

/**
 * Finds and sends an explicit canonical redirect before filesystem resolution.
 *
 * @param {object} context The request context created by the Awtsmoos server.
 * @returns {boolean} True when this function ended the response.
 */
function maybeSendPublicPathCanonicalRedirect(context) {
	var {
		request,
		response,
		awtsRes
	} = context.dependencies;

	if (!request || request.method !== "GET" || response.headersSent) {
		return false;
	}

	var requestUrl = request.url || "";
	var pathPart = requestUrl.split("?")[0].split("#")[0];
	var canonicalPath = CANONICAL_ALIASES[pathPart];

	if (!canonicalPath) {
		return false;
	}

	var suffix = requestUrl.substring(pathPart.length);
	var host = request.headers.host || "localhost";
	var forwardedHttps = request.headers["x-forwarded-proto"] === "https";
	var socketHttps = Boolean(request.socket && request.socket.encrypted);
	var protocol = socketHttps || forwardedHttps ? "https" : "http";
	var absoluteRedirectUrl = protocol + "://" + host + canonicalPath + suffix;
	var statusHeader = request.headers["awtsmoos-file-status"];
	var isStatusCheck = statusHeader === "true" || statusHeader === "1";

	if (isStatusCheck) {
		response.writeHead(200, {
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify({
			redirect: absoluteRedirectUrl
		}));
	} else {
		response.writeHead(301, {
			"Location": absoluteRedirectUrl
		});
		response.end();
	}

	awtsRes.ended = true;
	return true;
}

module.exports = {
	CANONICAL_ALIASES,
	maybeSendPublicPathCanonicalRedirect
};
