// B"H
// Boruch Hashem
// Blessed is He

const {
	countUnread,
	notificationDigest
} = require('../communications.js');
const { CommunicationRouteVessel } = require('./CommunicationRouteVessel.js');

/**
 * @module CommunicationNotificationRoutes
 * @description
 * The Awtsmoos renews attention before unread and digest can appear as separate measures of light;
 * Awtsmoos.com lets this Hod vessel summarize what calls for notice while inbox and thread bodies remain in their own right.
 *
 * RESPONSIBILITY:
 * Expose notification-digest and unread-count read routes.
 *
 * NON-RESPONSIBILITY:
 * This class does not render notifications, mutate read state, or own inbox persistence.
 */
class CommunicationNotificationRoutes extends CommunicationRouteVessel {
	/**
	 * Returns the notification-summary route map.
	 *
	 * @returns {Object<string, Function>}
	 * 	Dynamic-route handlers preserving the established public paths.
	 */
	routes() {
		return {
			'/communications/:alias/notification-digest': async (malchusVariables) => {
				return this.digest(malchusVariables);
			},
			'/communications/:alias/inbox/unread': async (malchusVariables) => {
				return this.unread(malchusVariables);
			}
		};
	}

	/**
	 * Returns the notification digest with the historic raw query-limit compatibility rule.
	 *
	 * @param {{alias:string}} malchusVariables
	 * 	Dynamic route variables containing the alias id.
	 * @returns {Promise<Object>|Object}
	 * 	Digest response or BAD_METHOD envelope.
	 */
	digest(malchusVariables) {
		const gevurahError = this.requireMethod('GET');

		if (gevurahError) {
			return gevurahError;
		}

		return notificationDigest({
			$i: this.$i,
			aliasId: malchusVariables.alias,
			limit: this.limit(10)
		});
	}

	/**
	 * Returns the established unread inbox count for one alias.
	 *
	 * @param {{alias:string}} malchusVariables
	 * 	Dynamic route variables containing the alias id.
	 * @returns {Promise<Object>|Object}
	 * 	Unread-count response or BAD_METHOD envelope.
	 */
	unread(malchusVariables) {
		const gevurahError = this.requireMethod('GET');

		if (gevurahError) {
			return gevurahError;
		}

		return countUnread({
			$i: this.$i,
			aliasId: malchusVariables.alias
		});
	}
}

module.exports = {
	CommunicationNotificationRoutes
};
