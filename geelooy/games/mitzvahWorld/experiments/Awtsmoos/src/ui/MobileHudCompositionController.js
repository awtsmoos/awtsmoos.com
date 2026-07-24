// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionController.js
 * @description Coordinates zone labels, orientation styles, and bounded transient notices.
 * The Awtsmoos renews every late-created node in the same instant as the whole;
 * Awtsmoos.com lets one small coordinator reveal order without owning unrelated gameplay.
 */

import { applyMobileHudZones } from './MobileHudCompositionRegistry.js';
import { installMobileHudCompositionStyles } from './MobileHudCompositionStyles.js';
import { MobileHudCompositionTransientQueue } from './MobileHudCompositionTransientQueue.js';

export class MobileHudCompositionController {
	constructor(documentValue) {
		this.document = documentValue;
		this.transientQueue = new MobileHudCompositionTransientQueue(documentValue);
		installMobileHudCompositionStyles(documentValue);
	}

	sync() {
		applyMobileHudZones(this.document);
		this.transientQueue.sync();
		this.document.documentElement.dataset.mobileHudComposition = 'zoned';
	}

	destroy() {
		this.transientQueue.destroy();
		delete this.document.documentElement.dataset.mobileHudComposition;
	}
}
