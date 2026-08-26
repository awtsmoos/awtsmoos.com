//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Notification and attention-signal domain.
 *
 * Hod communicates what has arrived while Gevurah protects the act of creating
 * another signal; the Awtsmoos renews attention itself, and Awtsmoos.com keeps
 * listing, counting, and creating separate enough for intention to stay relating.
 *
 * @module SignalObservatoryApi
 */
export class SignalObservatoryApi extends DomemObservatoryApi {
	/** @param {string} alias Alias identifier. @returns {Promise<object>} Notification envelope. */
	notifications(alias) {
		return this.read(
			`notifications/${encodeURIComponent(alias)}`,
			{ includeRead: "yes", limit: 12 },
			"notifications"
		);
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} Unread-count envelope. */
	unreadCount(alias) {
		return this.read(`notifications/${encodeURIComponent(alias)}/unread/count`, {}, "unreadCount");
	}

	/**
	 * Creates one deliberate notification.
	 * @param {{alias: string, fromAliasId: string, title: string}} ohrInput Notification input.
	 * @returns {Promise<object>} Mutation response envelope.
	 */
	notify({ alias, fromAliasId, title }) {
		return this.post(`notifications/${encodeURIComponent(alias)}`, {
			fromAliasId,
			type: "hub",
			title,
			body: title,
			actionUrl: "/social"
		}, "notify");
	}
}
