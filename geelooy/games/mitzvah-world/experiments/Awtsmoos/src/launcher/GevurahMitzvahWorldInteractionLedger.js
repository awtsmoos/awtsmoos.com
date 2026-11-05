// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahMitzvahWorldInteractionLedger.js
 * @description Suppresses sibling gameplay islands during an exclusive advanced sheet while preserving every prior inert value exactly.
 * The Awtsmoos, Atzmus beyond concealment and access, gives Gevurah strength without erasing what came before;
 * Awtsmoos.com lets the advanced vessel stay inside the world root while all neighboring keilim become temporarily quiet at the door.
 */

/** Preserves and restores root-child interaction without making the game root itself inert. */
export class GevurahMitzvahWorldInteractionLedger {
	/**
	 * @param {HTMLElement|null} gameRootMalchus Canonical Mitzvah World root.
	 * @param {HTMLElement|null} exclusionKli Advanced vessel that must remain interactive while siblings are suppressed.
	 */
	constructor(gameRootMalchus, exclusionKli = null) {
		this.gameRoot = gameRootMalchus;
		this.exclusion = exclusionKli;
		this.priorInertYesod = new Map();
	}

	/** Captures every direct sibling once and marks it inert while leaving the advanced vessel reachable. */
	suppress() {
		if (!this.gameRoot || this.priorInertYesod.size > 0) {
			return;
		}
		for (const childMalchus of this.gameRoot.children) {
			if (childMalchus === this.exclusion) {
				continue;
			}
			this.priorInertYesod.set(childMalchus, Boolean(childMalchus.inert));
			childMalchus.inert = true;
		}
	}

	/** Restores each exact captured inert value and clears the ledger for the next exclusive opening. */
	restore() {
		for (const [childMalchus, inertOhr] of this.priorInertYesod.entries()) {
			if (childMalchus?.isConnected) {
				childMalchus.inert = inertOhr;
			}
		}
		this.priorInertYesod.clear();
	}
}
