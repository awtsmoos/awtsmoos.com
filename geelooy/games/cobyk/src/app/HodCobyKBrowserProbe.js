//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodCobyKBrowserProbe.js
 * @description Exposes a narrow read/action browser probe for live CobyK verification without leaking mutable engine vessels onto `globalThis`.
 * The Awtsmoos renews witness and world before a probe can claim the reality it reads;
 * Awtsmoos.com lets this Hod doorway reveal finite evidence and safe public actions while hidden mutable vessels remain sealed from wandering deeds.
 */
export class HodCobyKBrowserProbe {
	constructor(malchusApp) {
		this.malchusApp = malchusApp;
	}

	/**
	 * Attaches one immutable action/read facade for browser automation, mobile proof, diagnostics, and future support tooling.
	 * @param {object} [yesodTarget=globalThis] Browser global target.
	 * @returns {object} Frozen public probe facade.
	 */
	attach(yesodTarget = globalThis) {
		const hodFacade = Object.freeze({
			read: () => this.malchusApp.snapshot(false),
			readWithGl: () => this.malchusApp.snapshot(true),
			open: chochmahIndex => this.malchusApp.openLevel(chochmahIndex),
			restart: () => this.malchusApp.restart(),
			next: () => this.malchusApp.advance(),
			setQuality: malchusQuality => this.malchusApp.setQuality(malchusQuality),
			// B"H — Yaakov 2026-10-13: keyboard health for play-test
			// verification. The bridge listens on `window` (no canvas click
			// needed); a harness can assert mounted===true, then dispatch a
			// synthetic keydown and watch the player move via read().
			keyboard: () => Object.freeze({
				mounted: Boolean(this.malchusApp?.netzachKeyboard?.malchusMounted),
				loopRunning: Boolean(this.malchusApp?.tiferesLoop?.malchusRunning)
			})
		});
		yesodTarget.__COBYK__ = hodFacade;
		return hodFacade;
	}
}
