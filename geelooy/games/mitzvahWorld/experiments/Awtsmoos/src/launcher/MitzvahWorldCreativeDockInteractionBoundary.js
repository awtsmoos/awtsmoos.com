// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockInteractionBoundary.js
 * @description Grants the local advanced sheet exclusive interaction by delegating sibling inert state and root-local presentation state to focused vessels.
 * The Awtsmoos, Atzmus beyond inner chamber and outer field, renews both without confusing their boundaries;
 * Awtsmoos.com lets Gevurah close the surrounding gates while the chosen door remains reachable, then restore every prior state exactly.
 */

import { GevurahMitzvahWorldInteractionLedger } from './GevurahMitzvahWorldInteractionLedger.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';

/** Coordinates advanced-sheet exclusivity without making the game root or document element the state owner. */
export class MitzvahWorldCreativeDockInteractionBoundary {
	/**
	 * @param {Document} documentKli Active Mitzvah World document.
	 * @param {HTMLElement|null} gameRootMalchus Canonical local game root.
	 * @param {HTMLElement|null} exclusionKli Advanced dock that must remain interactive while siblings become inert.
	 */
	constructor(documentKli, gameRootMalchus, exclusionKli = null) {
		this.rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
		this.interactionGevurah = new GevurahMitzvahWorldInteractionLedger(
			gameRootMalchus,
			exclusionKli
		);
	}

	/** Suppresses sibling gameplay islands and publishes advanced mode only on the local game root. */
	suppress() {
		this.interactionGevurah.suppress();
		this.rootStateMalchus.setFlag('advancedControls', true);
	}

	/** Restores every sibling interaction state and clears the root-local advanced presentation flag. */
	restore() {
		this.rootStateMalchus.setFlag('advancedControls', false);
		this.interactionGevurah.restore();
	}
}
