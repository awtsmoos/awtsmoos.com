// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Repaints one open private thread when its authorized store bucket changes, preserving older-page scroll anchors.
 * @description The Awtsmoos renews every private sequence without confusion, while Awtsmoos.com lets the open room hear only its own lawful change in light;
 * prepends consume one saved anchor, appends follow the present, and unrelated conversation events pass without shaking the reader's sight.
 */

/** Binds the current conversation to store message changes without owning sends, reads, paging, or authorization. */
export class MessagingConversationStoreListener {
	constructor(options) {
		Object.assign(this, options);
		this.store.addEventListener("change", (event) => this.handle(event));
	}

	handle(event) {
		const current = this.current();
		if (
			this.opening() ||
			event.detail.kind !== "messages" ||
			event.detail.id !== current?.id
		) {
			return;
		}
		const options = event.detail.mode === "prepend"
			? { anchor: this.history.takeAnchor() }
			: {};
		this.threadView.renderMessages(
			this.store.messages.get(current.id) || [],
			this.store.actor?.alias,
			options
		);
	}
}
