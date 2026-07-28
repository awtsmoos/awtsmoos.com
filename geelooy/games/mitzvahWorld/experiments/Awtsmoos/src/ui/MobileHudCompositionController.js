// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionController.js
 * @description Coordinates HUD zones through a bounded, dirty-aware synchronization cadence.
 * The Awtsmoos renews late-created nodes without needless repetition; Awtsmoos.com scans layout
 * at most eight times per second while transient notices and safe viewport rules remain current.
 */

import { applyMobileHudZones } from './MobileHudCompositionRegistry.js';
import { installMobileHudCompositionStyles } from './MobileHudCompositionStyles.js';
import { MobileHudCompositionTransientQueue } from './MobileHudCompositionTransientQueue.js';
import { installMinimalMeadowUiRepairStyles } from './MinimalMeadowUiRepairStyles.js';

const MINIMUM_SYNC_INTERVAL = 120;

export class MobileHudCompositionController {
	constructor(documentValue) {
		this.document = documentValue;
		this.transientQueue = new MobileHudCompositionTransientQueue(documentValue);
		this.lastSync = -Infinity;
		this.syncCount = 0;
		this.dirty = true;
		installMobileHudCompositionStyles(documentValue);
		installMinimalMeadowUiRepairStyles(documentValue);
	}

	markDirty() { this.dirty = true; }

	sync(force = false, now = performanceNow()) {
		if (!force && !this.dirty && now - this.lastSync < MINIMUM_SYNC_INTERVAL) return false;
		if (!force && now - this.lastSync < MINIMUM_SYNC_INTERVAL) return false;
		applyMobileHudZones(this.document);
		this.transientQueue.sync();
		this.document.documentElement.dataset.mobileHudComposition = 'zoned-safe';
		this.lastSync = now;
		this.syncCount += 1;
		this.dirty = false;
		return true;
	}

	diagnostics() {
		return { interval: MINIMUM_SYNC_INTERVAL, lastSync: this.lastSync, syncCount: this.syncCount };
	}

	destroy() {
		this.transientQueue.destroy();
		delete this.document.documentElement.dataset.mobileHudComposition;
	}
}

function performanceNow() { return globalThis.performance?.now?.() || Date.now(); }
