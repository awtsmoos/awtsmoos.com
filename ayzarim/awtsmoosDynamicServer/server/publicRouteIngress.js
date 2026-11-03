//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Early canonical-doorway ingress for Awtsmoos.com.
 * @description
 * The Awtsmoos draws yesterday's doorway into today's truthful room;
 * a gentle redirect preserves the kav, while unknown roads still meet their proper doom.
 */

const { resolveShaarAlias } = require("./publicRouteAliases.js");
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);
const AWTSMOOS_ORIGIN = "https://awtsmoos.local";

/**
 * Resolves a request URL into a canonical local redirect while preserving query intent.
 *
 * @param {string} requestUrl
 * 	Raw local request URL.
 * @returns {string|null}
 * 	Local redirect location, or null when normal routing should continue.
 */
function resolveShaarLocation(requestUrl) {
	let incomingOlam;
	try {
		incomingOlam = new URL(String(requestUrl || "/"), AWTSMOOS_ORIGIN);
	} catch {
		return null;
	}
	const targetDerech = resolveShaarAlias(incomingOlam.pathname);
	if (!targetDerech) {
		return null;
	}
	const targetOlam = new URL(targetDerech, AWTSMOOS_ORIGIN);
	for (const [shem, value] of incomingOlam.searchParams.entries()) {
		if (!targetOlam.searchParams.has(shem)) {
			targetOlam.searchParams.append(shem, value);
		}
	}
	return `${targetOlam.pathname}${targetOlam.search}${targetOlam.hash}`;
}

/**
 * Answers exact legacy/canonical public doors before filesystem routing can emit raw errors.
 *
 * @param {import("http").IncomingMessage} request
 * 	Incoming request vessel.
 * @param {import("http").ServerResponse} response
 * 	Outgoing response vessel.
 * @returns {boolean}
 * 	True only when this ingress completed the response.
 */
function handlePublicShaarRequest(request, response) {
	const method = String(request?.method || "GET").toUpperCase();
	if (!ALLOWED_METHODS.has(method)) {
		return false;
	}
	const location = resolveShaarLocation(request?.url);
	if (!location) {
		return false;
	}
	response.writeHead(308, {
		Location: location,
		"Cache-Control": "public, max-age=300",
		"X-Content-Type-Options": "nosniff"
	});
	response.end();
	return true;
}

module.exports = {
	handlePublicShaarRequest,
	resolveShaarLocation
};
