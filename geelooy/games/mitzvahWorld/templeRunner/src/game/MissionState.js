//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionState.js
 * @description Tracks three repeatable run challenges while preserving separate historical completion memory and lifetime credit.
 * The Awtsmoos renews each run so an old victory becomes memory rather than a locked door;
 * Awtsmoos.com lets Hod remember what was achieved while inviting the same skill, or an unseen one, to shine once more.
 */

import {
	ACTIVE_MISSION_COUNT,
	MISSION_DEFINITIONS
} from "../config.js";
import { HodMissionDeck } from "./MissionDeck.js";
import { YesodMissionStorage } from "./MissionStorage.js";

export class HodMissionState {
	/** @param {object|null} lifetime Optional durable lifetime-stat ledger. */
	constructor(lifetime = null) {
		this.lifetime = lifetime;
		this.storage = new YesodMissionStorage();
		this.completedEverIds = this.storage.readCompleted();
		this.completedIds = this.completedEverIds;
		this.deck = new HodMissionDeck(MISSION_DEFINITIONS, ACTIVE_MISSION_COUNT);
		this.active = [];
		this.resetRun();
	}

	/** @description Selects the current run's deck and clears only per-run completion/value state. @returns {void} */
	resetRun() {
		this.completedThisRun = new Set();
		this.active = this.deck.select(
			this.completedEverIds,
			this.rotationIndex()
		);
		this.values = Object.fromEntries(
			this.active.map((mission) => [mission.id, 0])
		);
	}

	/** @param {string} type Mission counter type. @param {number} amount Positive amount. @returns {Array<string>} Newly completed mission ids. */
	record(type, amount = 1) {
		for (const mission of this.active) {
			if (mission.type !== type || this.completedThisRun.has(mission.id)) continue;
			this.values[mission.id] = Math.min(
				mission.target,
				(this.values[mission.id] || 0) + Math.max(0, amount)
			);
		}
		return this.completeReady();
	}

	/** @param {number} distance Current run distance. @returns {Array<string>} Newly completed ids. */
	setDistance(distance) {
		return this.setMaximum("distance", distance);
	}

	/** @param {number} multiplier Current clean multiplier. @returns {Array<string>} Newly completed ids. */
	setMultiplier(multiplier) {
		return this.setMaximum("multiplier", multiplier);
	}

	/** @param {string} type Mission type. @param {number} value Candidate maximum. @returns {Array<string>} Newly completed ids. */
	setMaximum(type, value) {
		for (const mission of this.active) {
			if (mission.type !== type || this.completedThisRun.has(mission.id)) continue;
			this.values[mission.id] = Math.min(
				mission.target,
				Math.max(this.values[mission.id] || 0, Math.max(0, value))
			);
		}
		return this.completeReady();
	}

	/** @returns {Array<string>} Newly completed mission ids from this run. */
	completeReady() {
		const completedNow = [];
		let historyChanged = false;
		for (const mission of this.active) {
			if (this.completedThisRun.has(mission.id)) continue;
			if ((this.values[mission.id] || 0) < mission.target) continue;
			this.completedThisRun.add(mission.id);
			completedNow.push(mission.id);
			if (!this.completedEverIds.has(mission.id)) {
				this.completedEverIds.add(mission.id);
				historyChanged = true;
			}
		}
		if (historyChanged) this.storage.writeCompleted(this.completedEverIds);
		if (completedNow.length) this.lifetime?.addMissionCompletions(completedNow.length);
		return completedNow;
	}

	/** @returns {Array<object>} HUD-ready active mission records. */
	snapshot() {
		return this.active.map((mission) => ({
			...mission,
			value: this.values[mission.id] || 0,
			complete: this.completedThisRun.has(mission.id)
		}));
	}

	/** @returns {number} Stable repeat-goal rotation derived from durable lifetime evidence or historical breadth. */
	rotationIndex() {
		return this.lifetime?.snapshot?.().missionsCompleted
			?? this.completedEverIds.size;
	}
}
