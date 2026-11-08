// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @module ProtectedTextRoutes
 * @description
 * Thin route facade for the protected-text demo. All crypto lives in
 * services/ProtectedTextService.js; this file only maps HTTP to it.
 *
 * POST /api/protected-text/exchange { clientPublicKey } -> { sessionId, serverPublicKey, fontLayer }
 * GET  /api/protected-text/content?session=<id>        -> { iv, ciphertext, tag, fontIv, fontCiphertext, fontTag, ... }
 * POST /api/protected-text/rotate { sessionId }        -> { rotation }
 * GET  /api/protected-text/                             -> service status
 *
 * Nothing in any response contains the sample plaintext or any key material.
 */

const { ProtectedTextService } = require("./services/ProtectedTextService.js");
const {
	makeJsonResponse
} = require("../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js");

const service = new ProtectedTextService();

/**
 * Reads the POST body from the route context (already parsed by the server)
 * with a getPostData fallback.
 *
 * @param {object} $i Dynamic-route request context.
 * @returns {Promise<object>} Parsed body object.
 */
async function readBody($i) {
	const posted = $i.$_POST;
	if (posted && typeof posted === "object" && Object.keys(posted).length) {
		return posted;
	}
	if (typeof $i.getPostData === "function") {
		return (await $i.getPostData()) || {};
	}
	return {};
}

/**
 * Returns a JSON envelope with a real HTTP status. NOTE: returning a plain
 * object always normalizes to 200 in this framework, and setting
 * `response.statusCode` in the handler does not survive the response
 * pipeline — the wrapped envelope (statusCode + response) is the way a
 * route controls its status. The envelope also adds Cache-Control:
 * no-store, which is right for key material.
 *
 * @param {object} $i Dynamic-route request context (unused, kept for symmetry).
 * @param {number} status HTTP status.
 * @param {object} body Response body.
 * @returns {object} Wrapped JSON response envelope.
 */
function respond($i, status, body) {
	return makeJsonResponse(body, status);
}

/**
 * Registers the protected-text routes against the server's dynamic-route vessel.
 *
 * @param {object} $i Framework route context supplied by the Awtsmoos server.
 * @returns {Promise<void>} Resolves after the route map has been registered.
 */
async function registerProtectedTextRoutes($i) {
	await $i.use({
		"/": async () => respond($i, 200, service.status()),
		"/exchange": async () => {
			if ($i.request.method !== "POST") {
				return respond($i, 405, { ok: false, error: "method_not_allowed" });
			}
			const body = await readBody($i);
			try {
				return respond($i, 200, service.createSession(body.clientPublicKey));
			} catch (error) {
				return respond($i, 400, { ok: false, error: error.message });
			}
		},
		"/content": async () => {
			const sessionId = $i.$_GET && $i.$_GET.session;
			try {
				return respond($i, 200, service.content(sessionId));
			} catch (error) {
				return respond($i, 400, { ok: false, error: error.message });
			}
		},
		"/rotate": async () => {
			if ($i.request.method !== "POST") {
				return respond($i, 405, { ok: false, error: "method_not_allowed" });
			}
			const body = await readBody($i);
			try {
				return respond($i, 200, service.rotate(body.sessionId));
			} catch (error) {
				return respond($i, 400, { ok: false, error: error.message });
			}
		}
	});
}

module.exports = {
	dynamicRoutes: registerProtectedTextRoutes
};
