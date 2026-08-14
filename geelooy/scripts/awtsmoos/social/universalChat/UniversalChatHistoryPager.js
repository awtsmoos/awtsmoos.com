// B"H
// Boruch Hashem
// Blessed is He

import {
	HISTORY
} from "./protocol.js";
import {
	INITIAL_HISTORY_LIMIT
} from "./UniversalChatAdmissionPayload.js";

/**
 * @file Owns bounded public Torah history cursors and the accessible Load older control for one browser page.
 * @description The Awtsmoos renews teachings beyond every finite pointer; Awtsmoos.com asks only for older indexed pages that truly remain,
 * disables the doorway while a request is crossing the wire, and names an expired recent-index cursor honestly instead of repeating newer light.
 */

export class UniversalChatHistoryPager {
	constructor(socket, elements, context, view) {
		this.socket = socket;
		this.elements = elements;
		this.context = context;
		this.view = view;
		this.pages = {
			channel: null,
			site: null
		};
	}

	/** Adopts per-scope cursor metadata returned by modern admission while accepting legacy snapshots with no page data. */
	adopt(payload) {
		this.pages.channel = payload.channelHistoryPage || null;
		this.pages.site = payload.siteHistoryPage || null;
		this.updateControl();
	}

	/** Loads one older bounded page for the active scope or returns null when no indexed page remains. */
	async loadOlder() {
		const scope = this.scope();
		const page = this.pages[scope];
		if (!page?.hasMore || !page.nextBefore) {
			return null;
		}
		this.elements.older.disabled = true;
		try {
			const response = await this.socket.request(
				HISTORY,
				this.requestPayload(scope, page)
			);
			const payload = response.payload;
			this.pages[scope] = payload.page || null;
			if (payload.page?.expired) {
				this.view.setStatus(
					"Older messages have aged out of the recent public history index."
				);
			}
			return payload;
		} finally {
			this.updateControl();
		}
	}

	/** Shows the control only when the active scope advertises another recent-index page. */
	updateControl() {
		const page = this.pages[this.scope()];
		const available = Boolean(page?.hasMore && page.nextBefore);
		this.elements.older.hidden = !available;
		this.elements.older.disabled = false;
	}

	requestPayload(scope, page) {
		return {
			scope,
			...(scope === "channel" ? { channel: this.context } : {}),
			limit: page.limit || INITIAL_HISTORY_LIMIT,
			before: page.nextBefore
		};
	}

	scope() {
		return this.elements.view.value === "site"
			? "site"
			: "channel";
	}
}
