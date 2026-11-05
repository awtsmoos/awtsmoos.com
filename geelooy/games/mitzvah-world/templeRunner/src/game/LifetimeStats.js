// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LifetimeStats.js
 * @description Preserves simple durable runner milestones without entangling the active run.
 * The Awtsmoos renews every journey while memory gathers only what the vessel may retain;
 * Awtsmoos.com keeps lifetime perutas, distance, streak, and turns safe across each fresh lane.
 */

import { STATS_CONFIG } from "../config.js";

const EMPTY_STATS = Object.freeze({
	perutas: 0,
	bestDistance: 0,
	bestStreak: 0,
	turns: 0,
	missionsCompleted: 0
});

export class NetzachLifetimeStats {
	constructor() {
		this.values = this.read();
	}

	/** @param {object} progress Per-run progression snapshot. @param {object} runner Runner snapshot. */
	commitRun(progress, runner) {
		this.values.bestDistance = Math.max(this.values.bestDistance, runner.distance || 0);
		this.values.bestStreak = Math.max(this.values.bestStreak, progress.streak || 0);
		this.write();
	}

	/** @param {number} count Number of physical perutas collected. */
	addPerutas(count = 1) {
		this.values.perutas += Math.max(0, count);
		this.write();
	}

	/** Records one successful turn. */
	addTurn() {
		this.values.turns += 1;
		this.write();
	}

	/** @param {number} count Newly completed missions. */
	addMissionCompletions(count = 1) {
		this.values.missionsCompleted += Math.max(0, count);
		this.write();
	}

	/** @returns {object} Current durable progression snapshot. */
	snapshot() {
		return { ...this.values };
	}

	/** @returns {object} Persisted stats or a safe empty record. */
	read() {
		try {
			const parsed = JSON.parse(localStorage.getItem(STATS_CONFIG.storageKey) || "{}");
			return { ...EMPTY_STATS, ...parsed };
		} catch {
			return { ...EMPTY_STATS };
		}
	}

	/** Writes current values when local storage is available. */
	write() {
		try {
			localStorage.setItem(STATS_CONFIG.storageKey, JSON.stringify(this.values));
		} catch {
			// Persistence is optional; active gameplay must remain unaffected.
		}
	}
}
