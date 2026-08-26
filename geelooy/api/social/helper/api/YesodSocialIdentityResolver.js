// B"H
// Boruch Hashem
// Blessed is He

const { verifyApiKey } = require('../apiKeys.js');
const { loggedIn } = require('../general.js');

/**
 * @module YesodSocialIdentityResolver
 * @description
 * The Awtsmoos renews account and credential before the Social API can name an actor in light;
 * Awtsmoos.com lets this Yesod vessel reconcile session and API-key identity without confusing login with alias right.
 *
 * RESPONSIBILITY:
 * Resolve the authenticated account id from the existing session or verified API key and preserve the historic request-user shape.
 *
 * NON-RESPONSIBILITY:
 * This class does not authorize aliases, Heichel roles, ownership, moderation, or any domain mutation.
 */
class YesodSocialIdentityResolver {
	/**
	 * Resolves one Social API account identity without changing existing authentication precedence.
	 *
	 * @param {Object} malchusContext
	 * 	Awtsmoos dynamic-route request context.
	 * @returns {Promise<string|null>}
	 * 	Authenticated user id, or null when neither session nor API key resolves a user.
	 */
	async resolve(malchusContext) {
		if (loggedIn(malchusContext)) {
			return malchusContext.request.user.info.userId;
		}

		const yesodApiIdentity = await verifyApiKey({
			$i: malchusContext
		});
		const yesodUserId = yesodApiIdentity?.success?.userId;

		if (!yesodUserId) {
			return null;
		}

		malchusContext.request.user = {
			info: {
				userId: yesodUserId
			},
			apiKey: yesodApiIdentity.success.key
		};

		return yesodUserId;
	}
}

module.exports = {
	YesodSocialIdentityResolver
};
