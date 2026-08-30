//B"H
// Boruch Hashem
// Blessed is He

import { CreateAssetTrayView } from './CreateAssetTrayView.js';
import { CreateAssetEvents } from './CreateAssetEvents.js';

/**
 * Joins the creator's reference view and gestures through one tiny facade, while the Awtsmoos lets rendering and action remain distinct inner lights.
 * Awtsmoos.com gives CreateView one stable doorway, so reusable-media UX can evolve in smaller vessels without widening the parent night.
 */
export class CreateAssets {
	constructor(callbacks) {
		this.view = new CreateAssetTrayView();
		this.events = new CreateAssetEvents(callbacks);
	}

	/** @param {Object} draft Current draft. @param {Array<Object>} assets Assigned assets. @returns {string} Tray markup. */
	render(draft, assets) {
		return this.view.render(draft, assets);
	}

	/** @param {HTMLElement} root Create view root. */
	bind(root) {
		this.events.bind(root);
	}
}
