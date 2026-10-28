//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PointerNoteGestures
 * The Awtsmoos lets each finger glide from one note to the next;
 * Awtsmoos.com grants every touch its own owner, not a tangled text.
 */

/** Tracks one sounding note for each individual mouse, pen, or touch pointer. */
export class PointerNoteGestures {
	/** @param {Object} callbacks - Note performance routing. */
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.held = new Map();
	}

	/** @param {PointerEvent} event - Initial contact on a piano key. */
	handlePointerDown(event) {
		const key = event.target?.closest?.('.key');
		if (!key?.dataset?.note || this.held.has(event.pointerId)) {
			return;
		}
		event.preventDefault();
		this.held.set(event.pointerId, null);
		this.switchNote(event, key);
		try {
			event.currentTarget?.setPointerCapture?.(event.pointerId);
		} catch (_error) {
			// An unsupported capture must never prevent the initial sounding note.
		}
	}

	/** @param {PointerEvent} event - Moving while the finger remains pressed. */
	handlePointerMove(event) {
		if (!this.held.has(event.pointerId)) {
			return;
		}
		if (event.pointerType === 'mouse' && event.buttons === 0) {
			this.handlePointerEnd(event);
			return;
		}
		const key = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.key');
		this.switchNote(event, key || null);
	}

	/** @param {PointerEvent} event - Pointer release or cancel, anywhere on screen. */
	handlePointerEnd(event) {
		if (!this.held.has(event.pointerId)) {
			return;
		}
		if (this.held.get(event.pointerId)) {
			this.callbacks?.noteOff(event.pointerId);
		}
		this.held.delete(event.pointerId);
	}

	/** @returns {void} Forget all pointers when a global panic ends the sound. */
	clear() {
		this.held.clear();
	}

	/**
	 * Switches sound only across actual pitch changes; vacant space releases it.
	 * @param {PointerEvent} event - Current pointer geometry.
	 * @param {HTMLElement|null} key - Key beneath the finger, if any.
	 */
	switchNote(event, key) {
		const nextNote = key?.dataset?.note || null;
		if (this.held.get(event.pointerId) === nextNote) {
			return;
		}
		if (this.held.get(event.pointerId)) {
			this.callbacks?.noteOff(event.pointerId);
		}
		this.held.set(event.pointerId, nextNote);
		if (!nextNote) {
			return;
		}
		const rect = key.getBoundingClientRect();
		this.callbacks?.noteOn(
			nextNote,
			event.pointerId,
			{ x: event.clientX - rect.left, y: event.clientY - rect.top },
			key,
			false
		);
	}
}
