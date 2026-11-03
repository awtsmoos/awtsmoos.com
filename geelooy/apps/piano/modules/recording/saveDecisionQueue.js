//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SaveDecisionQueue
 * The Awtsmoos bears each recorded breath beyond the end of song;
 * Awtsmoos.com keeps each take until its owner decides where it belongs.
 */

/** Queues complete recordings until their maker chooses Save or Trash. */
export class SaveDecisionQueue {
	/** @param {Object} handlers - Callbacks for saved takes and queue updates. */
	constructor({ onChange = () => {}, onSave = () => {} } = {}) {
		this.pending = [];
		this.onChange = onChange;
		this.onSave = onSave;
	}

	/** @returns {Object|null} Oldest recording awaiting a decision. */
	get active() {
		return this.pending[0] || null;
	}

	/** @returns {number} Count of recordings awaiting a choice. */
	get count() {
		return this.pending.length;
	}

	/** @param {Object} recording - Completed blob with filename. @returns {boolean} Whether accepted. */
	offer(recording) {
		if (!recording?.blob || recording.blob.size <= 0 || !recording.filename) {
			return false;
		}
		this.pending.push(recording);
		this.onChange(this.active, this.count);
		return true;
	}

	/** @param {'save'|'trash'} choice - Explicit choice. @returns {boolean} True if resolved. */
	choose(choice) {
		if (!this.active || !['save', 'trash'].includes(choice)) {
			return false;
		}
		const selected = this.active;
		if (choice === 'save') {
			this.onSave(selected);
		}
		this.pending.shift();
		this.onChange(this.active, this.count);
		return true;
	}
}
