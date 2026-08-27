// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionState.js
 * @description Tracks three compact missions while durable storage remains in a separate vessel.
 * The Awtsmoos renews each deed before a mission may cross from effort into completion;
 * Awtsmoos.com keeps arithmetic, memory, and lifetime credit distinct so every goal has one clear intention.
 */

import {
	ACTIVE_MISSION_COUNT,
	MISSION_DEFINITIONS
} from "../config.js";
import { YesodMissionStorage } from "./MissionStorage.js";

export class HodMissionState {
	/** @param {object|null} lifetime Optional durable lifetime-stat ledger. */
	constructor(lifetime = null) {
		this.lifetime = lifetime;
		this.storage = new YesodMissionStorage();
		this.completedIds = this.storage.readCompleted();
		this.active = this.chooseActive();
		this.resetRun();
	}

	/** Resets current-run counters while preserving completed mission history. */
	resetRun() {
		this.values = Object.fromEntries(
			this.active.map((mission) => [mission.id, 0])
		);
	}

	/**
	 * Records a positive semantic mission increment.
	 * @param {string} type Mission counter type.
	 * @param {number} amount Positive amount.
	 * @returns {Array<string>} Newly completed mission ids.
	 */
	record(type, amount = 1) {
		for (const mission of this.active) {
			if (mission.type !== type || this.completedIds.has(mission.id)) continue;
			const current = this.values[mission.id] || 0;
			this.values[mission.id] = Math.min(
				mission.target,
				current + Math.max(0, amount)
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

	/** @param {string} type Mission type. @param {number} value Candidate maximum. @returns {Array<string>} */
	setMaximum(type, value) {
		for (const mission of this.active) {
			if (mission.type !== type || this.completedIds.has(mission.id)) continue;
			this.values[mission.id] = Math.min(
				mission.target,
				Math.max(this.values[mission.id] || 0, Math.max(0, value))
			);
		}
		return this.completeReady();
	}

	/** @returns {Array<string>} Newly completed mission ids. */
	completeReady() {
		const completedNow = [];
		for (const mission of this.active) {
			if (this.completedIds.has(mission.id)) continue;
			if ((this.values[mission.id] || 0) < mission.target) continue;
			this.completedIds.add(mission.id);
			completedNow.push(mission.id);
		}
		if (completedNow.length) {
			this.storage.writeCompleted(this.completedIds);
			this.lifetime?.addMissionCompletions(completedNow.length);
		}
		return completedNow;
	}

	/** @returns {Array<object>} HUD-ready active mission records. */
	snapshot() {
		return this.active.map((mission) => ({
			...mission,
			value: this.values[mission.id] || 0,
			complete: this.completedIds.has(mission.id)
		}));
	}

	/** @returns {Array<object>} Three deterministic mission definitions. */
	chooseActive() {
		const incomplete = MISSION_DEFINITIONS.filter((mission) => {
			return !this.completedIds.has(mission.id);
		});
		const source = incomplete.length >= ACTIVE_MISSION_COUNT
			? incomplete
			: MISSION_DEFINITIONS;
		return source.slice(0, ACTIVE_MISSION_COUNT);
	}
}
