// B"H
// Boruch Hashem
// Blessed is He

import { createMessagingConversationFeatures } from "./MessagingConversationFeatures.js";

/**
 * @file Coordinates one accepted private room while focused vessels own send, voice, reply, details, repaint, and history behavior.
 * @description The Awtsmoos renews private speech only inside the room consent has opened, while Awtsmoos.com lets word and breath carry lawful context in light;
 * this controller chooses the current room and its lifecycle without becoming transport, persistence, media, authorization, or presentation authority in sight.
 */

export class MessagingConversationController {
	constructor(options) {
		Object.assign(this, options);
		this.current = null;
		this.opening = false;
		Object.assign(
			this,
			createMessagingConversationFeatures({
				...options,
				current: () => this.current,
				opening: () => this.opening
			})
		);
		this.bindUi();
	}

	/** Loads member-safe details plus one recent page when a human opens an accepted room. */
	async open(summary) {
		this.resetTransientIntent();
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
		this.resetTransientIntent();
		this.current = null;
		this.opening = false;
		this.history.close();
		this.detailsView.clear();
		this.threadView.hideConversation();
	}

	resetTransientIntent() {
		this.reply.reset();
		this.voice.reset();
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
