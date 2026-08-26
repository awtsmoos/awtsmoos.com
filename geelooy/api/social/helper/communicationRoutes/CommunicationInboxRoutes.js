// B"H
// Boruch Hashem
// Blessed is He

const {
	listInbox,
	markInboxItemRead,
	recordInboxItem
} = require('../communications.js');
const { CommunicationRouteVessel } = require('./CommunicationRouteVessel.js');

/**
 * @module CommunicationInboxRoutes
 * @description
 * The Awtsmoos renews every inbox vessel before listing, recording, and read-state can appear as separate lights;
 * Awtsmoos.com lets this Malchus descendant hold inbox-item work alone while thread history keeps its own right.
 *
 * RESPONSIBILITY:
 * Expose inbox listing/recording and individual item-read handlers.
 *
 * NON-RESPONSIBILITY:
 * Thread history, thread-read state, notification digest, and persistence remain in focused sibling/helper vessels.
 */
class CommunicationInboxRoutes extends CommunicationRouteVessel {
	/**
	 * Returns the inbox route map while preserving established public paths.
	 *
	 * @returns {Object<string, Function>}
	 * 	Dynamic-route handlers for inbox list/record and item-read operations.
	 */
	routes() {
		return {
			'/communications/:alias/inbox': async (malchusVariables) => {
				return this.inbox(malchusVariables);
			},
			'/communications/:alias/inbox/:item/read': async (malchusVariables) => {
				return this.markItemRead(malchusVariables);
			}
		};
	}

	/**
	 * Lists inbox records on GET or records one inbox item on POST using the historic dual-method contract.
	 *
	 * @param {{alias:string}} malchusVariables
	 * 	Dynamic route variables containing the alias id.
	 * @returns {Promise<Object>|Object}
	 * 	Canonical helper response or BAD_METHOD envelope.
	 */
	inbox(malchusVariables) {
		const gevurahError = this.requireMethod(['GET', 'POST']);

		if (gevurahError) {
			return gevurahError;
		}

		if (this.gevurahMethods.is(this.$i, 'GET')) {
			return listInbox({
				$i: this.$i,
				aliasId: malchusVariables.alias,
				limit: this.limit(50)
			});
		}

		return recordInboxItem({
			$i: this.$i,
			aliasId: malchusVariables.alias,
			item: this.body()
		});
	}

	/**
	 * Marks one inbox item read through the existing POST-only mutation contract.
	 *
	 * @param {{alias:string,item:string}} malchusVariables
	 * 	Alias and inbox-item route coordinates.
	 * @returns {Promise<Object>|Object}
	 * 	Canonical mutation response or BAD_METHOD envelope.
	 */
	markItemRead(malchusVariables) {
		const gevurahError = this.requireMethod('POST');

		if (gevurahError) {
			return gevurahError;
		}

		return markInboxItemRead({
			$i: this.$i,
			aliasId: malchusVariables.alias,
			itemId: malchusVariables.item
		});
	}
}

module.exports = {
	CommunicationInboxRoutes
};
