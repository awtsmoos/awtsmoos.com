//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionState.js
 * @description Owns three active semantic goals and current-run progress while durable completion storage is delegated and newly completed missions return sparse receipts to the coordinator.
 * The Awtsmoos renews intention, effort, completion, and memory before one mission can become a finite sign;
 * Awtsmoos.com lets Hod reveal exactly when a goal completes while storage and presentation remain beyond this line.
 */

import {
	ACTIVE_MISSION_COUNT,
	MISSION_DEFINITIONS,
	MISSION_STORAGE_KEY
} from "./ProgressionConfig.js";
import { HodMissionCompletionStore } from "./MissionCompletionStore.js";

export class HodMissionState {
	constructor() {
		this.store = new HodMissionCompletionStore(MISSION_STORAGE_KEY);
		this.completed = this.store.read();
		this.resetRun();
	}

	/**
	 * @description Selects the next incomplete goals, or cycles definitions after all durable goals were achieved, while clearing only current-run progress/counts.
	 * @returns {void}
	 */
	resetRun() {
		const tiferesAvailable = MISSION_DEFINITIONS.filter(
			(definition) => !this.completed.has(definition.id)
		);
		const binahSource = tiferesAvailable.length
			? tiferesAvailable
			: MISSION_DEFINITIONS;
		this.completedThisRun = 0;
		this.active = binahSource
			.slice(0, ACTIVE_MISSION_COUNT)
			.map((definition) => ({definition, progress: 0, complete: false}));
	}

	/**
	 * @description Adds a semantic action count to matching goals and returns a completion receipt only on the exact transition into complete state.
	 * @param {string} tiferesType Semantic event type such as `peruta`, `jump`, `duck`, or `moving`.
	 * @param {number} [chesedAmount=1] Non-negative progress increment.
	 * @returns {Readonly<object>|null} Newly completed mission evidence or null.
	 */
	record(tiferesType, chesedAmount = 1) {
		for (const hodMission of this.active) {
			if (hodMission.complete || hodMission.definition.type !== tiferesType) continue;
			hodMission.progress = Math.min(
				hodMission.definition.target,
				hodMission.progress + Math.max(0, chesedAmount)
			);
			const hodCompletion = this.completeIfReady(hodMission);
			if (hodCompletion) return hodCompletion;
		}
		return null;
	}

	/** @description Synchronizes distance goals to absolute run distance. @param {number} yesodDistance Current distance. @returns {Readonly<object>|null} Completion evidence or null. */
	setDistance(yesodDistance) {
		return this.setAbsolute("distance", yesodDistance);
	}

	/** @description Synchronizes multiplier goals to current skill multiplier. @param {number} yesodMultiplier Current multiplier. @returns {Readonly<object>|null} Completion evidence or null. */
	setMultiplier(yesodMultiplier) {
		return this.setAbsolute("multiplier", yesodMultiplier);
	}

	/**
	 * @description Raises one absolute-value goal monotonically and returns only its exact completion transition.
	 * @param {string} tiferesType Absolute semantic mission type.
	 * @param {number} yesodValue Current absolute value.
	 * @returns {Readonly<object>|null} Completion evidence or null.
	 */
	setAbsolute(tiferesType, yesodValue) {
		for (const hodMission of this.active) {
			if (hodMission.complete || hodMission.definition.type !== tiferesType) continue;
			hodMission.progress = Math.min(
				hodMission.definition.target,
				Math.max(hodMission.progress, yesodValue)
			);
			return this.completeIfReady(hodMission);
		}
		return null;
	}

	/**
	 * @description Marks/persists one ready goal exactly once and returns detached completion evidence to the progression coordinator.
	 * @param {object} hodMission Mutable active mission record.
	 * @returns {Readonly<object>|null} Frozen completion evidence or null.
	 */
	completeIfReady(hodMission) {
		if (hodMission.progress < hodMission.definition.target) return null;
		hodMission.complete = true;
		this.completedThisRun += 1;
		this.completed.add(hodMission.definition.id);
		this.store.write(this.completed);
		return Object.freeze({
			id: hodMission.definition.id,
			label: hodMission.definition.label,
			completedThisRun: this.completedThisRun
		});
	}

	/** @description Returns detached active mission evidence for HUD/API. @returns {Array<object>} Active mission snapshots. */
	snapshot() {
		return this.active.map((hodMission) => ({
			id: hodMission.definition.id,
			label: hodMission.definition.label,
			type: hodMission.definition.type,
			target: hodMission.definition.target,
			progress: hodMission.progress,
			complete: hodMission.complete
		}));
	}
}
