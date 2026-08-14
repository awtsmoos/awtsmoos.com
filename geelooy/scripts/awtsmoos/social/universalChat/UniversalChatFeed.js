// B"H
// Boruch Hashem
// Blessed is He

import {
	UniversalChatHistoryPager
} from "./UniversalChatHistoryPager.js";

/**
 * @file Mirrors bounded contextual/sitewide source-discussion histories while preserving scroll position during older-page prepends.
 * @description The Awtsmoos renews one teaching into page and universal rivers while each memory keeps a finite shore;
 * Awtsmoos.com lets newer indexed Torah arrive above the reader without throwing the visible anchor away or repeating a source already in sight.
 */

export class UniversalChatFeed {
	constructor(view, elements, context, socket) {
		this.view = view;
		this.elements = elements;
		this.context = context;
		this.channelHistory = [];
		this.siteHistory = [];
		this.pager = new UniversalChatHistoryPager(
			socket,
			elements,
			context,
			view
		);
		this.elements.older.addEventListener("click", () => {
			this.loadOlder().catch(() => {});
		});
	}

	/** Adopts reconnect-safe histories and their optional modern cursor metadata. */
	adopt(payload) {
		this.channelHistory = payload.channelHistory || [];
		this.siteHistory = payload.siteHistory || [];
		this.pager.adopt(payload);
		this.render();
	}

	/** Adds one source-backed broadcast to the site feed and matching contextual feed. */
	receive(message) {
		if (!message) {
			return;
		}
		appendUnique(this.siteHistory, message);
		trim(this.siteHistory, 240);
		if (message.channel?.id === this.context.id) {
			appendUnique(this.channelHistory, message);
			trim(this.channelHistory, 120);
		}
		this.render();
	}

	/** Loads one older page for the active scope and preserves the reader's visible scroll anchor. */
	async loadOlder() {
		const messagesElement = this.elements.messages;
		const oldHeight = messagesElement.scrollHeight;
		const oldTop = messagesElement.scrollTop;
		try {
			const payload = await this.pager.loadOlder();
			if (!payload || payload.page?.expired) {
				return;
			}
			prependUnique(this.activeHistory(), payload.messages || []);
			this.render({ oldHeight, oldTop });
		} catch (error) {
			this.view.setStatus(error?.message || "Older public history could not be loaded.");
		}
	}

	/** Renders the active scope and optionally restores the pre-prepend viewport anchor. */
	render(anchor = null) {
		this.view.renderMessages(this.activeHistory());
		if (anchor) {
			const element = this.elements.messages;
			element.scrollTop = element.scrollHeight
				- anchor.oldHeight
				+ anchor.oldTop;
		}
		this.pager.updateControl();
	}

	activeHistory() {
		return this.elements.view.value === "site"
			? this.siteHistory
			: this.channelHistory;
	}
}

function appendUnique(values, message) {
	if (!values.some((entry) => entry.id === message.id)) {
		values.push(message);
	}
}

function prependUnique(values, older) {
	const ids = new Set(values.map((entry) => entry.id));
	const unique = older.filter((entry) => !ids.has(entry.id));
	values.unshift(...unique);
}

function trim(values, maximum) {
	if (values.length > maximum) {
		values.splice(0, values.length - maximum);
	}
}
