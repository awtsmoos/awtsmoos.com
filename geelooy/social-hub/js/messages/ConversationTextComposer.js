//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationTextComposer
 * @description
 * The Awtsmoos is beyond typed word and failed delivery, while Awtsmoos.com lets one text draft remain intact until the private-message covenant truly accepts it;
 * this Hod-like helper owns text submit, emoji insertion, and busy state only, while reply coordinates and voice breath remain in neighboring vessels of light.
 */
export class ConversationTextComposer {
	/**
	 * Creates one draft sender around an already-built SmartTextArea and canonical reply state.
	 * @param {object} options Focused text-composer dependencies.
	 */
	constructor({ elements, replyState, status, onSend }) {
		Object.assign(this, {
			elements,
			replyState,
			status,
			onSend
		});
		this.smart = elements.smart;
		this.input = elements.input;
		this.busy = false;
	}

	/** Sends the current text with reply coordinates and clears only after accepted delivery. */
	async submit() {
		const text = this.smart.value();
		if (!text || this.busy) return false;
		this.setBusy(true);
		this.status.info('Sending…');
		try {
			await this.onSend(text, this.replyState.payload());
			this.smart.clear();
			this.replyState.clear();
			this.status.clear();
			this.smart.focus();
			return true;
		} catch (error) {
			this.status.error(error.message || 'Message was not sent. Try again.');
			return false;
		} finally {
			this.setBusy(false);
		}
	}

	/** Inserts one emoji at the current selection without changing submit semantics. */
	insertEmoji(event) {
		event?.preventDefault();
		const start = this.input.selectionStart ?? this.input.value.length;
		const end = this.input.selectionEnd ?? start;
		this.input.setRangeText('😊', start, end, 'end');
		this.input.dispatchEvent(new Event('input', { bubbles: true }));
		this.input.focus();
	}

	/** Mirrors text-send busy truth into SmartTextArea plus send/mic actions. */
	setBusy(busy) {
		this.busy = Boolean(busy);
		this.smart.setBusy(this.busy);
		this.elements.send.disabled = this.busy;
		this.elements.mic.disabled = this.busy;
		this.elements.send.dataset.busy = String(this.busy);
	}

	/** Clears the room-scoped draft while preserving the built composer DOM. */
	reset() {
		this.smart.clear();
		this.setBusy(false);
	}
}
