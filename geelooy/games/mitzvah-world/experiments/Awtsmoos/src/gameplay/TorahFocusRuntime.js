// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahFocusRuntime.js
 * @description Enforces canonical passage identity, ownership, focus, cooldown, and renewal.
 * The Awtsmoos is infinite while player attention is intentionally finite; Awtsmoos.com
 * refuses forged statistics and lets only learned wisdom in an owned sefer enter play.
 */

import { torahPassage } from './TorahPassageCatalog.js';

export class TorahFocusRuntime {
	/**
	 * @param {object} inventoryStore - Authoritative learning and item store.
	 * @param {object} options - Focus regeneration and initial-value options.
	 */
	constructor(inventoryStore, options = {}) {
		this.inventory = inventoryStore;
		this.regenerationPerSecond = options.regenerationPerSecond ?? 4;
		this.maximumFocus = this.resolveMaximum();
		this.focus = options.focus ?? this.maximumFocus;
	}

	/**
	 * Attempts one canonical study action without trusting caller-supplied statistics.
	 * @param {object} proposedPassage - Passage-shaped request containing a catalog id.
	 * @param {number} now - Explicit wall-clock instant in milliseconds.
	 * @returns {object} Accepted canonical passage or structured rejection.
	 */
	tryUse(proposedPassage, now = Date.now()) {
		const passage = torahPassage(proposedPassage?.id);
		if (!passage) return rejected('UNKNOWN_PASSAGE', this);
		const snapshot = this.inventory.snapshot();
		if (!snapshot.learned.includes(passage.id)) {
			return rejected('PASSAGE_NOT_LEARNED', this);
		}
		if (!ownsBook(snapshot, passage.bookId)) {
			return rejected('BOOK_NOT_OWNED', this);
		}
		const readyAt = Number(snapshot.lastUsedAt[passage.id] || 0)
			+ passage.cooldownMs;
		if (now < readyAt) {
			return rejected('PASSAGE_COOLDOWN', this, readyAt - now);
		}
		if (this.focus < passage.focusCost) {
			return rejected('INSUFFICIENT_FOCUS', this);
		}
		this.focus -= passage.focusCost;
		this.inventory.markPassageUsed(passage.id, now);
		return {
			focus: this.focus,
			maximumFocus: this.maximumFocus,
			ok: true,
			passage
		};
	}

	/** Regenerates bounded focus against the current equipment maximum. */
	update(deltaTime) {
		this.maximumFocus = this.resolveMaximum();
		this.focus = Math.min(
			this.maximumFocus,
			this.focus + Math.max(0, deltaTime) * this.regenerationPerSecond
		);
		return this.snapshot();
	}

	/** Returns a detached focus receipt. */
	snapshot() {
		return {
			focus: this.focus,
			maximumFocus: this.maximumFocus
		};
	}

	resolveMaximum() {
		return Math.max(1, Number(this.inventory.snapshot().stats.focus) || 20);
	}
}

function ownsBook(snapshot, bookId) {
	return snapshot.items.some(item => (
		item.itemId === bookId && Number(item.quantity || 0) > 0
	));
}

function rejected(reason, runtime, retryAfterMs = 0) {
	return {
		...runtime.snapshot(),
		ok: false,
		reason,
		retryAfterMs
	};
}
