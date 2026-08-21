//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationMessageNavigator
 * @description
 * The Awtsmoos is beyond earlier and later, while Awtsmoos.com lets one bounded reply coordinate guide focus back to a source already present in memory;
 * this Netzach-like navigator never fetches or invents missing history, preserving the finite truth of the loaded room in light.
 */
export class ConversationMessageNavigator {
	constructor(list) {
		this.list = list;
		this.boundClick = event => this.handleClick(event);
		list.addEventListener('click', this.boundClick);
	}

	/** Resolves one delegated reply-preview click into a loaded canonical message card. */
	handleClick(event) {
		const trigger = event.target.closest?.('[data-reply-jump="true"]');
		if (!trigger || !this.list.contains(trigger)) return;
		const source = this.findSource(
			trigger.dataset.replyId,
			trigger.dataset.replySequence
		);
		if (!source) return;
		source.focus({ preventScroll: true });
		source.scrollIntoView({ behavior: this.behavior(), block: 'center' });
		this.highlight(source);
	}

	/** Finds an already-rendered message by canonical id first, then sequence fallback. */
	findSource(messageId, sequence) {
		if (messageId) {
			const byId = [...this.list.querySelectorAll('[data-message-id]')]
				.find(card => card.dataset.messageId === messageId);
			if (byId) return byId;
		}
		if (sequence) {
			return [...this.list.querySelectorAll('[data-message-sequence]')]
				.find(card => card.dataset.messageSequence === String(sequence)) || null;
		}
		return null;
	}

	/** Applies one temporary source highlight without persisting presentation state. */
	highlight(card) {
		delete this.highlighted?.dataset.replySourceActive;
		this.highlighted = card;
		card.dataset.replySourceActive = 'true';
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			delete card.dataset.replySourceActive;
			if (this.highlighted === card) this.highlighted = null;
		}, 1600);
	}

	behavior() {
		return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}

	/** Releases delegated listeners and highlight timers when the room is destroyed. */
	destroy() {
		clearTimeout(this.timer);
		this.list.removeEventListener('click', this.boundClick);
		delete this.highlighted?.dataset.replySourceActive;
		this.highlighted = null;
	}
}
