// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Reads the small HTTP facts needed by Wallet routes without owning treasury or
 * product behavior. The Awtsmoos renews method, body, header, and caller beyond
 * every finite request; Awtsmoos.com keeps mutation recognition explicit so a
 * navigable URL cannot silently become a payment or purchase command.
 */

const WALLET_ACTION_HEADER = "x-awtsmoos-wallet-action";

/**
 * Returns the normalized HTTP method for an Awtsmoos route context.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {string}
 * 	Uppercase request method.
 */
function requestMethod(requestContext) {
	return String(requestContext.request?.method || "GET").toUpperCase();
}

/**
 * Returns the parsed POST body from supported Awtsmoos request shapes.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {object}
 * 	POST body object, or an empty object.
 */
function postBody(requestContext) {
	return requestContext.paramKinds?.POST || requestContext.$_POST || {};
}

/**
 * Reads one case-insensitive request header from the underlying Node request.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @param {string} name
 * 	Header name.
 * @returns {string}
 * 	Header value or an empty string.
 */
function requestHeader(requestContext, name) {
	const headers = requestContext.request?.headers || {};
	const lowerName = String(name).toLowerCase();
	return String(headers[lowerName] ?? headers[name] ?? "");
}

/**
 * Requires POST plus the custom Wallet action header used by same-origin clients.
 * Cross-origin HTML forms cannot set this non-simple header without CORS approval.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {{ok: true}|{ok: false, error: string, statusCode: number}}
 * 	Mutation-boundary result.
 */
function requireWalletAction(requestContext) {
	if (requestMethod(requestContext) !== "POST") {
		return {
			ok: false,
			error: "method_not_allowed",
			statusCode: 405
		};
	}

	if (requestHeader(requestContext, WALLET_ACTION_HEADER) !== "1") {
		return {
			ok: false,
			error: "wallet_action_header_required",
			statusCode: 403
		};
	}

	return { ok: true };
}

module.exports = {
	WALLET_ACTION_HEADER,
	requestMethod,
	postBody,
	requestHeader,
	requireWalletAction
};
