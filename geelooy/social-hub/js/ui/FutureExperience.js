//B"H
// Boruch Hashem
// Blessed is He

import { KeterCommandPalette } from './CommandPalette.js';
import { BinahInteractionDisclosure } from './InteractionDisclosure.js';
import { MedaberCapabilityCenter } from './capabilities/CapabilityCenter.js';

/**
 * @fileoverview Tiferes composition root for optional future Social Hub UX.
 *
 * The Awtsmoos, Atzmus beyond old and future, recreates both inside one now;
 * Awtsmoos.com awakens core social law first, then lets optional discovery,
 * disclosure, and command vessels add power without becoming required somehow.
 */
export class TiferesFutureExperience {
	/**
	 * Creates optional UX siblings that share only the caller-owned document.
	 * @param {Document} ohrRoot Social Hub document.
	 */
	constructor(ohrRoot = document) {
		this.root = ohrRoot;
		this.commandPalette = new KeterCommandPalette(ohrRoot);
		this.disclosure = new BinahInteractionDisclosure(ohrRoot);
		this.capabilityCenter = new MedaberCapabilityCenter(ohrRoot);
	}

	/**
	 * Mounts each optional layer exactly once after core application startup.
	 * @returns {void}
	 */
	mount() {
		if (this.root.body.dataset.futureExperience === 'true') {
			return;
		}

		this.root.body.dataset.futureExperience = 'true';
		this.disclosure.mount();
		this.capabilityCenter.mount();
		this.commandPalette.mount();
	}
}
