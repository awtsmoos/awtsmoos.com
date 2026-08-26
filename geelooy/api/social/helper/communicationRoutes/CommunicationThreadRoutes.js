// B"H
// Boruch Hashem
// Blessed is He

const {
	getThread,
	markThreadRead
} = require('../communications.js');
const { CommunicationRouteVessel } = require('./CommunicationRouteVessel.js');

/**
 * @module CommunicationThreadRoutes
 * @description
 * The Awtsmoos renews a thread before its messages can appear as past and present in light;
 * Awtsmoos.com lets this Netzach vessel hold thread history and read covenant alone while inbox items keep their separate right.
 *
 * RESPONSIBILITY:
 * Expose thread-history and thread-read handlers.
 *
 * NON-RESPONSIBILITY:
 * Inbox recording, notification summaries, room rendering, and persistence remain in focused sibling/helper vessels.
 */
class CommunicationThreadRoutes extends CommunicationRouteVessel {
	/**
	 * Returns the thread route map while preserving established public paths.
	 *
	 * @returns {Object<string, Function>}
	 * 	Dynamic-route handlers for thread history and thread read state.
	 */
	routes() {
		return {
			'/communications/:alias/threads/:thread': async (malchusVariables) => {
				return this.thread(malchusVariables);
			},
			'/communications/:alias/threads/:thread/read': async (malchusVariables) => {
				return this.markRead(malchusVariables);
			}
		};
	}

	/**
	 * Loads one communication thread using the established raw query-limit compatibility rule.
	 *
	 * @param {{alias:string,thread:string}} malchusVariables
	 * 	Alias and thread route coordinates.
	 * @returns {Promise<Object>|Object}
	 * 	Canonical thread response or BAD_METHOD envelope.
	 */
	thread(malchusVariables) {
		const gevurahError = this.requireMethod('GET');

		if (gevurahError) {
			return gevurahError;
		}

		return getThread({
			$i: this.$i,
			aliasId: malchusVariables.alias,
			threadId: malchusVariables.thread,
			limit: this.limit(100)
		});
	}

	/**
	 * Marks a complete thread read through the established POST-only mutation path.
	 *
	 * @param {{alias:string,thread:string}} malchusVariables
	 * 	Alias and thread route coordinates.
	 * @returns {Promise<Object>|Object}
	 * 	Canonical mutation response or BAD_METHOD envelope.
	 */
	markRead(malchusVariables) {
		const gevurahError = this.requireMethod('POST');

		if (gevurahError) {
			return gevurahError;
		}

		return markThreadRead({
			$i: this.$i,
			aliasId: malchusVariables.alias,
			threadId: malchusVariables.thread
		});
	}
}

module.exports = {
	CommunicationThreadRoutes
};
