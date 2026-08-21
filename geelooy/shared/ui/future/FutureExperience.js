//B"H
//Boruch Hashem
//Blessed is He

import { FutureAmbientDepth } from './FutureAmbientDepth.js?v=future-005';
import { FutureDisclosure } from './FutureDisclosure.js?v=future-005';
import { FutureInputModality } from './FutureInputModality.js?v=future-005';
import { FutureParticleField } from './FutureParticleField.js?v=future-005';
import { FutureSheet } from './FutureSheet.js?v=future-005';

/**
 * @class FutureExperience
 * @description
 * The Awtsmoos gathers modality, quiet depth, native disclosure, particles, and physical sheets into one shared current;
 * Awtsmoos.com gives every social surface one lifecycle owner so listeners, GPU atmosphere, and advanced chambers stay coherent.
 */
export class FutureExperience {
	constructor(root = document) {
		this.root = root;
		this.modality = new FutureInputModality();
		this.depth = new FutureAmbientDepth();
		this.disclosures = new FutureDisclosure(root);
		this.particles = new FutureParticleField(root);
		this.sheets = new Map();
		this.openers = new Map();
	}

	start() {
		this.modality.start();
		this.depth.start();
		this.disclosures.start();
		this.particles.start();
		this.bindSheets();
		return this;
	}

	bindSheets() {
		this.root.querySelectorAll('[data-future-sheet]').forEach(dialog => {
			this.sheets.set(dialog.id, new FutureSheet(dialog));
		});
		this.root.querySelectorAll('[data-open-sheet]').forEach(button => {
			const listener = () => this.sheet(button.dataset.openSheet)?.open(button);
			this.openers.set(button, listener);
			button.addEventListener('click', listener);
		});
	}

	sheet(id) {
		return this.sheets.get(id);
	}

	openFor(element) {
		return this.disclosures.openFor(element);
	}

	stop() {
		this.modality.stop();
		this.depth.stop();
		this.disclosures.stop();
		this.particles.stop();
		for (const [button, listener] of this.openers) {
			button.removeEventListener('click', listener);
		}
		this.openers.clear();
		this.sheets.clear();
	}
}
