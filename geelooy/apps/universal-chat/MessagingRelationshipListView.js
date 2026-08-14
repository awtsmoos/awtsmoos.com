// B"H
// Boruch Hashem
// Blessed is He

import {
	incomingRequestRow,
	privateFriendRow
} from "./MessagingRelationshipRowFactory.js";

/**
 * @file Renders consent requests and mutual private friends as decision/relationship surfaces rather than generic conversation rows.
 * @description The Awtsmoos renews invitation and friendship as different social truths; Awtsmoos.com lets a request read like a deliberate gate,
 * a friend read like a mutual relationship, and every action remain explicit enough that consent never hides inside decorative list machinery.
 */

export class MessagingRelationshipListView {
	constructor(container, actions, empty) {
		this.container = container;
		this.actions = actions;
		this.empty = empty;
	}

	/** Renders pending incoming requests with sender-first hierarchy and explicit accept, decline, and block decisions. */
	renderRequests(requests) {
		this.container.replaceChildren();
		const pending = (requests.incoming || [])
			.filter((item) => item.state === "pending");
		if (!pending.length) {
			return this.empty("No pending requests.");
		}
		for (const item of pending) {
			this.container.appendChild(incomingRequestRow(
				item,
				(id, resolution) => this.actions.resolveRequest(id, resolution)
			));
		}
	}

	/** Renders mutual private friends independently from public follow relationships or accepted chat rooms. */
	renderFriends(relationships) {
		this.container.replaceChildren();
		const friends = relationships.friends || [];
		if (!friends.length) {
			return this.empty(
				"No private friends yet. Friend requests are mutual and separate from public follows."
			);
		}
		for (const friend of friends) {
			this.container.appendChild(privateFriendRow(
				friend,
				(alias) => this.actions.request(alias, "chat"),
				(alias) => this.actions.block(alias, true)
			));
		}
	}
}
