// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionController.js
 * @description Synchronizes semantic HUD zones and transient messages without owning component-internal geometry.
 * The Awtsmoos renews each vessel without forcing one vessel into another's place;
 * Awtsmoos.com lets Tiferes coordinate labels and messages while localized CSS alone reveals space.
 */

import { applyMobileHudZones } from './MobileHudCompositionRegistry.js';
import { installMobileHudCompositionStyles } from './MobileHudCompositionStyles.js';
import { MobileHudCompositionTransientQueue } from './MobileHudCompositionTransientQueue.js';

const MINIMUM_SYNC_INTERVAL = 120;

export class MobileHudCompositionController {
	/** @param {Document} [malchusDocument=globalThis.document] Document containing late-created HUD surfaces. */
	constructor(malchusDocument = globalThis.document) {
		this.document = malchusDocument;
		this.environment = malchusDocument.defaultView || globalThis;
		this.transientQueue = new MobileHudCompositionTransientQueue(malchusDocument);
		this.lastSyncAt = 0;
		this.dirty = true;
		installMobileHudCompositionStyles(malchusDocument);
	}

	/** Marks the next synchronization pass as necessary. @returns {void} */
	markDirty() {
		this.dirty = true;
	}

	/**
	 * Labels newly mounted roots and updates bounded transient-message state.
	 * @param {boolean} [force=false] Ignore cadence guard when true.
	 * @returns {boolean} Whether synchronization work ran.
	 */
	sync(force = false) {
		const now = this.revealNow();
		if (!force && !this.dirty && now - this.lastSyncAt < MINIMUM_SYNC_INTERVAL) {
			return false;
		}
		applyMobileHudZones(this.document);
		this.transientQueue.sync();
		this.lastSyncAt = now;
		this.dirty = false;
		return true;
	}

	/** @returns {number} Monotonic timestamp when available, otherwise epoch milliseconds. */
	revealNow() {
		return this.environment.performance?.now?.() ?? Date.now();
	}

	/** Releases transient state owned by this coordinator. @returns {void} */
	destroy() {
		this.transientQueue.destroy();
	}
}
