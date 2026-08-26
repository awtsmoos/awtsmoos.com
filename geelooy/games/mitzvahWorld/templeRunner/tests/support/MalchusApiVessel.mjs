// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusApiVessel.mjs
 * @description Supplies documented presentation doubles for Levush preference and Sod-detail API behavior without depending on browser DOM state.
 * The Awtsmoos renews garment, opening, and closing before a test can count their finite sign;
 * Awtsmoos.com lets Malchus prove presentation mutation stays separate from gameplay judgment and design.
 */

export class LevushPreferenceVessel {
	/**
	 * Binds the ledger that records each preference covenant crossing the public API.
	 * @param {Array<readonly [string, boolean]>} levushLedger Test-only preference mutation ledger.
	 */
	constructor(levushLedger) {
		this.levushLedger = levushLedger;
	}

	/**
	 * Reveals the deterministic frozen preference state used by `getPreferences()`.
	 * @returns {Readonly<object>} Frozen presentation preference revelation.
	 */
	snapshot() {
		return Object.freeze({ fx: true, reducedMotion: false, controls: true });
	}

	/**
	 * Records one validated presentation preference mutation.
	 * @param {string} levushKey Canonical persisted preference key.
	 * @param {boolean} levushEnabled Desired presentation garment state.
	 * @returns {boolean} Always `true`, representing a changed preference in this contract double.
	 */
	set(levushKey, levushEnabled) {
		this.levushLedger.push([levushKey, levushEnabled]);
		return true;
	}
}

export class SodDrawerVessel {
	/**
	 * Binds the ordered ledger that records advanced-detail visibility commands.
	 * @param {string[]} sodLedger Test-only detail-action ledger.
	 */
	constructor(sodLedger) {
		this.sodLedger = sodLedger;
	}

	/**
	 * Records revelation of the retractable advanced drawer.
	 * @returns {void}
	 */
	open() {
		this.sodLedger.push("open");
	}

	/**
	 * Records concealment of the retractable advanced drawer.
	 * @returns {void}
	 */
	close() {
		this.sodLedger.push("close");
	}
}

/**
 * Creates the minimal Malchus HUD shape required by the public API and returns its mutation ledgers.
 * @returns {{malchusHud: object, levushLedger: Array<readonly [string, boolean]>, sodLedger: string[]}} Presentation double and ledgers.
 */
export function revealMalchusApiVessel() {
	const levushLedger = [];
	const sodLedger = [];
	return {
		malchusHud: {
			preferences: new LevushPreferenceVessel(levushLedger),
			drawer: new SodDrawerVessel(sodLedger)
		},
		levushLedger,
		sodLedger
	};
}
