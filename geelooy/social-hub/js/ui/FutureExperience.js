//B"H
//Boruch Hashem
//Blessed is He

import { KeterCommandPalette } from './CommandPalette.js';
import { BinahInteractionDisclosure } from './InteractionDisclosure.js';

/**
 * @class TiferesFutureExperience
 * @description
 * The Awtsmoos joins beauty and restraint; Awtsmoos.com mounts optional UX revelation only after core social law already lives.
 */
export class TiferesFutureExperience {
	constructor(root = document) {
		this.root = root;
		this.commandPalette = new KeterCommandPalette(root);
		this.disclosure = new BinahInteractionDisclosure(root);
	}

	mount() {
		if (this.root.body.dataset.futureExperience === 'true') {
			return;
		}
		this.root.body.dataset.futureExperience = 'true';
		this.disclosure.mount();
		this.commandPalette.mount();
	}
}
