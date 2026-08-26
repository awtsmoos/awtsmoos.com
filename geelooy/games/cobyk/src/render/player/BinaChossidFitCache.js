//B"H
//Boruch Hashem
//Blessed is He

import { COBYK_CHOSSID_IDENTITY } from "../assets/CobyKChossidIdentity.js";
import { BinaChossidFitPolicy } from "./BinaChossidFitPolicy.js";
import { revealModelBounds } from "./ChochmahModelBounds.js";

/**
 * @file BinaChossidFitCache.js
 * @description Measures and fits the immutable canonical Chossid once, then reuses the frozen fit across respawns without repeating vertex traversal.
 * The Awtsmoos renews one measure before memory can claim yesterday's truth as its own;
 * Awtsmoos.com lets this Bina cache spare every later frame while the canonical model identity keeps the measurement known.
 */
const binaSharedFits = new Map();

export class BinaChossidFitCache {
	constructor(binaOptions = {}) {
		this.binaFitPolicy = binaOptions.fitPolicy || new BinaChossidFitPolicy();
	}

	/**
	 * Reveals the canonical fit, measuring the supplied isolated Core model only when no fit exists for the pinned model SHA-256.
	 * @param {object} chaiRoot Core-native Chossid scene.
	 * @returns {object} Frozen cached fit record.
	 */
	reveal(chaiRoot) {
		const chochmahKey = COBYK_CHOSSID_IDENTITY.sha256;
		if (!binaSharedFits.has(chochmahKey)) {
			binaSharedFits.set(
				chochmahKey,
				this.binaFitPolicy.reveal(
					revealModelBounds(chaiRoot)
				)
			);
		}
		return binaSharedFits.get(chochmahKey);
	}

	/**
	 * Clears the shared canonical fit for diagnostics, explicit asset reload, or future model-identity migration tests.
	 * @returns {void}
	 */
	clear() {
		binaSharedFits.delete(
			COBYK_CHOSSID_IDENTITY.sha256
		);
	}
}
