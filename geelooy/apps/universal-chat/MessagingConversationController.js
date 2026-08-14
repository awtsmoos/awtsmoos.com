// B"H
// Boruch Hashem
// Blessed is He

import { MessagingConversationDetails } from "./MessagingConversationDetails.js";
import { MessagingConversationSender } from "./MessagingConversationSender.js";
import { MessagingConversationStoreListener } from "./MessagingConversationStoreListener.js";
import { MessagingHistoryPager } from "./MessagingHistoryPager.js";

/**
 * @file Owns one accepted private room while send lifecycle, details, store repainting, and history paging live in smaller vessels.
 * @description The Awtsmoos renews private speech only inside the room consent has opened, and Awtsmoos.com keeps that room bright in light;
 * bounded history preserves place, a serialized sender protects intent, and every mutation remains inside the existing private protocol rather than this coordinator's sight.
 */

/** Coordinates one opened accepted room without owning authorization, persistence, submission state, or presentation-only geometry. */
export class MessagingConversationController {
	constructor(options) {
		Object.assign(this, options);
		this.current = null;
		this.opening = false;
		this.history = new MessagingHistoryPager(this.elements, this.store, this.actions);
		this.sender = new MessagingConversationSender({
			elements: this.elements,
			actions: this.actions,
			current: () => this.current
		});
		this.detailsView = new MessagingConversationDetails({
			elements: this.elements,
			groupActions: this.groupActions,
			modal: this.modal,
			store: this.store,
			threadView: this.threadView
		});
		this.storeListener = new MessagingConversationStoreListener({
			store: this.store,
			history: this.history,
			threadView: this.threadView,
			current: () => this.current,
			opening: () => this.opening
		});
		this.bindUi();
	}

	/** Loads member-safe details plus one recent page only when a human opens the accepted room. */
	async open(summary) {
		this.current = summary;
		this.opening = true;
		try {
			const [details, messages] = await Promise.all([
				this.actions.details(summary.id),
				this.actions.loadHistory(summary.id)
			]);
			this.detailsView.set(details);
			this.threadView.showConversation(
				summary,
				messages,
				this.store.actor?.alias
			);
			this.history.open(summary.id, messages);
			this.mobile?.showThread();
			this.markLatestRead(messages, summary);
		} finally {
			this.opening = false;
		}
	}

	close() {
		this.current = null;
		this.opening = false;
		this.history.close();
		this.detailsView.clear();
		this.threadView.hideConversation();
	}

	bindUi() {
		this.elements.detailsToggle.addEventListener(
			"click",
			() => this.detailsView.show()
		);
		this.elements.detailsClose.addEventListener("click", () => {
			this.elements.details.hidden = true;
		});
	}

	markLatestRead(messages, summary) {
		const latest = messages.at(-1)?.sequence || summary.lastSequence || 0;
		if (latest) {
			this.actions.markRead(summary.id, latest).catch(() => {});
		}
	}
}
