//B"H
//Boruch Hashem
//Blessed is He

import {
	MessagingVoiceClock,
	formatElapsed
} from '../../../apps/universal-chat/MessagingVoiceClock.js';

/**
 * @class ConversationVoiceView
 * @description
 * The Awtsmoos is beyond recording, preview, sending, and retry, while Awtsmoos.com lets each finite voice stage become visible without owning microphone or upload state;
 * this Hod-like view reflects one compact Social voice note through custom controls and gives the surrounding controller a quiet vessel of light.
 */
export class ConversationVoiceView {
	constructor(elements) {
		this.elements = elements;
		this.clock = new MessagingVoiceClock(elements.clock);
	}

	/** Reveals active recording state and starts the honest elapsed-time clock. */
	recording() {
		this.elements.region.hidden = false;
		this.elements.status.textContent = 'Recording voice note…';
		this.elements.player.clear();
		this.elements.player.setHidden(true);
		this.elements.stop.hidden = false;
		this.elements.cancel.hidden = false;
		this.elements.send.hidden = true;
		this.enableActions();
		this.clock.start();
	}

	/** Reveals a local unsent preview without implying upload or delivery succeeded. */
	preview(url, durationMs = 0) {
		this.clock.stop();
		this.elements.region.hidden = false;
		this.elements.status.textContent = 'Voice note ready';
		this.elements.clock.textContent = formatElapsed(durationMs / 1000);
		this.elements.player.setSource(url);
		this.elements.player.setHidden(false);
		this.elements.stop.hidden = true;
		this.elements.cancel.hidden = false;
		this.elements.send.hidden = false;
		this.enableActions();
	}

	/** Shows upload/delivery progress while preserving the custom local preview. */
	busy(message = 'Sending voice note…') {
		this.clock.stop();
		this.elements.region.hidden = false;
		this.elements.status.textContent = message;
		this.elements.stop.hidden = true;
		this.elements.cancel.disabled = true;
		this.elements.send.disabled = true;
	}

	/**
	 * Shows a visible error; retry controls appear only when an unsent preview still exists.
	 * @param {string} message Human-readable failure text.
	 * @param {boolean} [retryable=true] Whether Send voice should remain available.
	 */
	error(message, retryable = true) {
		this.clock.stop();
		this.elements.region.hidden = false;
		this.elements.status.textContent = message || 'Voice note was not sent. Try again.';
		this.elements.stop.hidden = true;
		this.elements.cancel.hidden = false;
		this.elements.send.hidden = !retryable;
		this.enableActions();
	}

	/** Resets every visible voice control without owning the preview URL itself. */
	reset() {
		this.clock.reset();
		this.elements.region.hidden = true;
		this.elements.status.textContent = 'Voice note';
		this.elements.player.clear();
		this.elements.player.setHidden(true);
		this.elements.stop.hidden = false;
		this.elements.cancel.hidden = false;
		this.elements.send.hidden = true;
		this.enableActions();
	}

	/** Restores voice actions after a bounded busy or error state. */
	enableActions() {
		this.elements.cancel.disabled = false;
		this.elements.send.disabled = false;
	}
}
