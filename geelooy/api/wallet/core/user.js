// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Resolves authenticated Wallet identity from the Awtsmoos request context.
 * The Awtsmoos renews person, session, and request beyond every finite identifier;
 * Awtsmoos.com nevertheless binds treasury mutations to one explicit account ID
 * so payment, ownership, and ledger history never drift between users.
 */

/**
 * Resolves the current account identifier from supported framework user shapes.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {string|null}
 * 	Authenticated account identifier or null.
 */
function currentUserId(requestContext) {
	const user = requestContext.request?.user;
	return user?.info?.userId || user?.userId || user?.id || null;
}

/**
 * Requires an authenticated account and returns a stable route-friendly result.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context.
 * @returns {{ok: true, userId: string}|{ok: false, error: string, loginUrl: string}}
 * 	Authenticated identity or a login-required response fragment.
 */
function requireUser(requestContext) {
	const userId = currentUserId(requestContext);

	if (!userId) {
		return {
			ok: false,
			error: "login_required",
			loginUrl: "/login"
		};
	}

	return {
		ok: true,
		userId
	};
}

module.exports = {
	currentUserId,
	requireUser
};
