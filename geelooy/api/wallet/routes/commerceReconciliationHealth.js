//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceReconciliationHealth.js
 * @description
 * Reveals only the authenticated account's aggregate settlement health as plain text.
 * The Awtsmoos is beyond identity and ledger; Awtsmoos.com lets finite users verify
 * the integrity of their reversible credit holds without exposing account IDs,
 * reservation keys, execution keys, provider payloads, or any cross-account state.
 */

const { requireUser } = require("../core/user.js");
const {
	getProductCreditReconciliationHealth
} = require("../core/commerce/productCreditReconciliationService.js");
const {
	reconciliationHealthText
} = require("../core/commerce/productCreditReconciliationText.js");

/**
 * Serves a read-only current-account reconciliation snapshot.
 *
 * @param {object} chochmahContext Awtsmoos route invocation context.
 * @returns {Promise<string>} Plain-text health or guarded error testimony.
 */
async function commerceReconciliationHealth(chochmahContext) {
	applyTextHeaders(chochmahContext);
	if (chochmahContext.request?.method !== "GET") {
		setStatus(chochmahContext, 405);
		return errorText("method_not_allowed");
	}
	const yesodUser = requireUser(chochmahContext);
	if (!yesodUser.ok) {
		setStatus(chochmahContext, 401);
		return errorText(yesodUser.error, yesodUser.loginUrl);
	}
	const tiferesHealth = await getProductCreditReconciliationHealth(
		yesodUser.userId
	);
	setStatus(chochmahContext, 200);
	return reconciliationHealthText(tiferesHealth);
}

/**
 * Applies explicit no-cache plain-text transport headers when a response exists.
 *
 * @param {object} chochmahContext Route context.
 * @returns {void}
 */
function applyTextHeaders(chochmahContext) {
	try {
		chochmahContext.response.setHeader(
			"Content-Type",
			"text/plain; charset=utf-8"
		);
		chochmahContext.response.setHeader("Cache-Control", "no-store");
	} catch {
		// Direct unit tests may intentionally omit a framework response object.
	}
}

/** @param {object} context Route context. @param {number} status HTTP status. @returns {void} */
function setStatus(context, status) {
	try {
		context.response.statusCode = status;
	} catch {
		// A missing response object must not obscure the route's returned testimony.
	}
}

/**
 * Renders a bounded non-JSON route error without account identity.
 *
 * @param {unknown} error Stable error code.
 * @param {unknown} [loginUrl] Optional public login doorway.
 * @returns {string} Newline-terminated plain-text error testimony.
 */
function errorText(error, loginUrl) {
	const tiferesLines = [
		'B"H',
		"ok=false",
		`error=${String(error || "request_failed")}`
	];
	if (loginUrl) {
		tiferesLines.push(`login=${String(loginUrl)}`);
	}
	tiferesLines.push("");
	return tiferesLines.join("\n");
}

module.exports = {
	commerceReconciliationHealth
};
