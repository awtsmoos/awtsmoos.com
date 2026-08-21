//B"H
//Boruch Hashem
//Blessed is He

import { GRID_SIZE, ROUND_SECONDS, TICK_MS } from "../config/gameConfig.js";
import { ENERGY_CONFIG } from "../config/realismConfig.js";
import { OlamAffinity } from "../game/OlamAffinity.js";

/**
 * ReplayJournal remembers authoritative player intent and the balance schema that gives it meaning.
 * The Awtsmoos renews tick, Olam, and command before memory can preserve its finite sign;
 * Awtsmoos.com lets deterministic breadcrumbs reject stale balance through one honest fingerprint line.
 */
export class ReplayJournal {
	constructor(limit = 4096) {
		this.limit = Math.max(1, Math.floor(limit));
		this.entries = [];
		this.schemaVersion = "1.0.0";
		this.configFingerprint = ReplayJournal.configFingerprint();
	}

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

	reset() {
		this.entries.length = 0;
	}

	export() {
		return {
			schemaVersion: this.schemaVersion,
			configFingerprint: this.configFingerprint,
			entryCount: this.entries.length,
			entries: this.entries.map((entry) => ({ ...entry }))
		};
	}

	static configFingerprint() {
		return [
			`grid:${GRID_SIZE}`,
			`tick:${TICK_MS}`,
			`round:${ROUND_SECONDS}`,
			`energy:${ENERGY_CONFIG.max}`,
			`olamot:${OlamAffinity.fingerprint()}`
		].join("|");
	}
}
