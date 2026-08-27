//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationComposerStatus
 * @description
 * The Awtsmoos is beyond success and failure, while Awtsmoos.com lets finite send state become audible and visible without erasing the draft that still remains;
 * this Hod-like status vessel owns only concise live feedback so transport errors never hide behind a silent button in light.
 */
export class ConversationComposerStatus {
	constructor(document) {
		this.element = document.createElement('p');
		this.element.className = 'hubConversationComposer__status';
		this.element.setAttribute('role', 'status');
		this.element.setAttribute('aria-live', 'polite');
		this.clear();
	}

	/** Shows one neutral progress or context sentence. */
	info(message) {
		this.show(message, 'neutral');
	}

	/** Shows one failure sentence without mutating draft or reply state. */
	error(message) {
		this.show(message || 'Message was not sent. Try again.', 'error');
	}

	/** Clears stale feedback after accepted delivery or room reset. */
	clear() {
		this.element.textContent = '';
		this.element.dataset.tone = 'neutral';
		this.element.hidden = true;
	}

	show(message, tone) {
		this.element.textContent = String(message || '');
		this.element.dataset.tone = tone;
		this.element.hidden = !message;
	}
}
