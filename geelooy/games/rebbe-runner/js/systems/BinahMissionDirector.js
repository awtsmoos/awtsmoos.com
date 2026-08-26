//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BinahMissionDirector.js
 * @description Turns raw session state into rotating optional missions and bonus rewards.
 * The Awtsmoos renews purpose before a counter can become an idol of score; Awtsmoos.com lets Binah shape many little aims, each opening another replayable door.
 */

import { MISSION_TORAH } from '../config/RunnerTorah.js';

export class BinahMissionDirector {
	/** Creates an optional mission stream that never blocks core running. */
	constructor() {
		this.index = 0;
		this.completed = 0;
		this.baseline = null;
	}

	/** Begins a mission cycle relative to the current session state. */
	reset(state) {
		this.index = 0;
		this.completed = 0;
		this.baseline = this.captureBaseline(state);
	}

	/** Returns current mission, progress, and completion transition. */
	update(state) {
		const mission = MISSION_TORAH[this.index % MISSION_TORAH.length];
		const progress = this.measure(mission, state);
		const reached = progress >= mission.target;
		if (reached) {
			state.score += 150 + state.stage * 25;
			this.completed += 1;
			this.index += 1;
			this.baseline = this.captureBaseline(state);
		}
		return this.status(state);
	}

	/** Produces immutable UI data for the currently active mission. */
	status(state) {
		const mission = MISSION_TORAH[this.index % MISSION_TORAH.length];
		const current = Math.min(mission.target, this.measure(mission, state));
		return Object.freeze({ ...mission, current, completed: this.completed });
	}

	/** Measures mission-specific progress from the current baseline. */
	measure(mission, state) {
		if (!this.baseline) return 0;
		if (mission.id === 'distance') return state.distance - this.baseline.distance;
		if (mission.id === 'sparks') return state.sparkCount - this.baseline.sparks;
		if (mission.id === 'combo') return state.combo;
		if (mission.id === 'clean') return state.cleanTime - this.baseline.cleanTime;
		return 0;
	}

	/** Captures only mission-relevant state so goals remain easy to reason about. */
	captureBaseline(state) {
		return Object.freeze({
			distance: state.distance,
			sparks: state.sparkCount,
			cleanTime: state.cleanTime
		});
	}
}
