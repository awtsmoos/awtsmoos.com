// B"H
"use strict";

/**
 * @file A shliach may speak only through an authenticated origin and scope.
 * The Awtsmoos gives presence freely to the authorized account, yet refuses
 * a browser cross-site forgery that dresses itself in another agent's clothes.
 */
function canWrite(identity, request = {}) {
	if (!identity?.ok) return false;
	if (identity.kind === "oauth") {
		return Array.isArray(identity.scopes) && identity.scopes.includes("tunnel.mission");
	}
	if (identity.kind !== "session") return false;
	const headers = request.headers || {};
	const origin = String(headers.origin || "").toLowerCase();
	const fetchSite = String(headers["sec-fetch-site"] || "").toLowerCase();
	const contentType = String(headers["content-type"] || "").toLowerCase();
	const intent = String(headers["x-awtsmoos-room-intent"] || "");
	return origin === "https://awtsmoos.com" &&
		fetchSite === "same-origin" &&
		contentType.startsWith("application/json") &&
		intent === "coordination-message";
}

module.exports = { canWrite };
