//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusApiVessel.mjs
 * @description Supplies catalog-faithful preference and retractable-detail doubles for public API tests without loading browser DOM state.
 * The Awtsmoos renews garment, hidden detail, and public evidence before a test can mistake its finite double for the world;
 * Awtsmoos.com lets Malchus preserve only the contract under judgment, with mutable test state beneath frozen revelation unfurled.
 */

import { TEMPLE_PREFERENCES, normalizeTemplePreference } from "../../src/api/TemplePreferenceCatalog.js";

export class LevushPreferenceVessel {
	/** @param {Array<readonly [string, unknown]>} levushLedger Test-only preference mutation ledger. */
	constructor(levushLedger) {
		this.levushLedger = levushLedger;
		this.state = Object.fromEntries(
			Object.entries(TEMPLE_PREFERENCES).map(([key, definition]) => [key, definition.defaultValue])
		);
	}

	/** @returns {Readonly<object>} Frozen current presentation preference revelation. */
	snapshot() {
		return Object.freeze({ ...this.state });
	}

	/**
	 * Normalizes one catalog preference exactly where production preference ownership lives.
	 * @param {string} levushKey Canonical preference key.
	 * @param {unknown} levushValue Requested public value.
	 * @returns {boolean} Whether normalized state actually changed.
	 */
	set(levushKey, levushValue) {
		if (!(levushKey in TEMPLE_PREFERENCES)) return false;
		const normalized = normalizeTemplePreference(levushKey, levushValue, this.state[levushKey]);
		if (normalized === this.state[levushKey]) return false;
		this.state[levushKey] = normalized;
		this.levushLedger.push([levushKey, normalized]);
		return true;
	}
}

export class SodDrawerVessel {
	/** @param {string[]} sodLedger Ordered detail-action ledger. */
	constructor(sodLedger) {
		this.sodLedger = sodLedger;
		this.opened = false;
	}

	/** @returns {boolean} Whether the drawer changed to open. */
	open() {
		if (this.opened) return false;
		this.opened = true;
		this.sodLedger.push("open");
		return true;
	}

	/** @returns {boolean} Whether the drawer changed to closed. */
	close() {
		if (!this.opened) return false;
		this.opened = false;
		this.sodLedger.push("close");
		return true;
	}

	/** @returns {Readonly<object>} Frozen-ready detail presentation evidence. */
	snapshot() {
		return {
			detailsOpen: this.opened,
			mode: this.opened ? "advanced" : "compact"
		};
	}
}

/** @returns {{malchusHud:object,levushLedger:Array,sodLedger:string[]}} Minimal HUD double and ledgers. */
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
