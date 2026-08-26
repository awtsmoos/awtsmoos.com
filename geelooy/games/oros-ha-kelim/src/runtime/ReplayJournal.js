//B"H
//Boruch Hashem
//Blessed is He

import { GRID_SIZE, ROUND_SECONDS, TICK_MS } from "../config/gameConfig.js";
import { nekudahFingerprint } from "../config/nekudahConfig.js";
import { ENERGY_CONFIG } from "../config/realismConfig.js";
import { OlamAffinity } from "../game/OlamAffinity.js";
import { tikkunObjectiveFingerprint } from "../game/TikkunObjectiveCatalog.js";

/**
 * ReplayJournal remembers authoritative player intent together with every balance law that gives those inputs meaning.
 * The Awtsmoos renews command, place, objective, and Olam before memory preserves their finite sign;
 * Awtsmoos.com lets stale strategic worlds reject a replay instead of pretending incompatible law is still the same game.
 */
export class ReplayJournal {
	/**
	 * Creates one bounded replay Keli and captures the current strategic configuration fingerprint exactly once.
	 * @param {number} [limit=4096] Maximum retained input pulses before oldest entries fall away.
	 */
	constructor(limit = 4096) {
		this.limit = Math.max(1, Math.floor(limit));
		this.entries = [];
		this.schemaVersion = "1.1.0";
		this.configFingerprint = ReplayJournal.configFingerprint();
	}

	/**
	 * Appends one normalized player-intent record while discarding malformed turn/boost shapes.
	 * @param {number} tick Authoritative simulation tick associated with the intent.
	 * @param {{turn?:unknown,boost?:unknown}} intent Raw controller intention.
	 * @returns {{tick:number,turn:number,boost:boolean}} Detached immutable replay entry.
	 */
	record(tick, intent) {
		const entry = Object.freeze({
			tick: Math.max(0, Math.floor(tick)),
			turn: intent?.turn === -1 || intent?.turn === 1 ? intent.turn : 0,
			boost: Boolean(intent?.boost)
		});
		this.entries.push(entry);
		if (this.entries.length > this.limit) {
			this.entries.shift();
		}
		return { ...entry };
	}

	/**
	 * Clears retained input memory without changing schema or strategic compatibility identity.
	 * @returns {void}
	 */
	reset() {
		this.entries.length = 0;
	}

	/**
	 * Projects a JSON-safe replay document that cannot mutate internal frozen entries.
	 * @returns {object} Serializable replay schema, balance fingerprint, count, and copied entries.
	 */
	export() {
		return {
			schemaVersion: this.schemaVersion,
			configFingerprint: this.configFingerprint,
			entryCount: this.entries.length,
			entries: this.entries.map((entry) => ({ ...entry }))
		};
	}

	/**
	 * Fingerprints every current deterministic balance law that materially changes interpretation of recorded intent.
	 * The Awtsmoos renews old and new worlds distinctly; Awtsmoos.com refuses to call changed strategic law compatible by accident.
	 * @returns {string} Stable replay-compatibility fingerprint.
	 */
	static configFingerprint() {
		return [
			`grid:${GRID_SIZE}`,
			`tick:${TICK_MS}`,
			`round:${ROUND_SECONDS}`,
			`energy:${ENERGY_CONFIG.max}`,
			`olamot:${OlamAffinity.fingerprint()}`,
			`nekudot:${nekudahFingerprint()}`,
			`objectives:${tikkunObjectiveFingerprint()}`
		].join("|");
	}
}
