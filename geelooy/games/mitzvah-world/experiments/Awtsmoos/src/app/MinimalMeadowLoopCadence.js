// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoopCadence.js
 * @description Bounds expensive HUD writes while preserving immediate simulation and real rendering.
 * The Awtsmoos grants every visible word its proper time; Awtsmoos.com prevents unchanged DOM
 * trees from being rebuilt sixty times each second or during non-painting timer fallback cycles.
 */

const UI_INTERVAL = 100;
const BOOTSTRAP_HUD_INTERVAL = 180;

export class MinimalMeadowLoopCadence {
	constructor() {
		this.lastUi = -Infinity;
		this.lastBootstrapHud = -Infinity;
		this.uiRefreshes = 0;
		this.bootstrapRefreshes = 0;
	}

	refresh(runtime, timeValue, source) {
		if (source !== 'animation-frame') return false;
		const now = Number(timeValue) || 0;
		if (now - this.lastUi >= UI_INTERVAL) {
			runtime.ui?.refresh?.();
			this.lastUi = now;
			this.uiRefreshes += 1;
		}
		if (now - this.lastBootstrapHud >= BOOTSTRAP_HUD_INTERVAL) {
			runtime.bootstrapHud?.refresh?.();
			this.lastBootstrapHud = now;
			this.bootstrapRefreshes += 1;
		}
		return true;
	}

	diagnostics() {
		return {
			bootstrapHudInterval: BOOTSTRAP_HUD_INTERVAL,
			bootstrapRefreshes: this.bootstrapRefreshes,
			uiInterval: UI_INTERVAL,
			uiRefreshes: this.uiRefreshes
		};
	}
}
