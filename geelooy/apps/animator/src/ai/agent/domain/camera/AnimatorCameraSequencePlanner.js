// B"H
// Boruch Hashem
// Blessed is He

import { AutomaticShotPlanner } from '../../../../camera/planning/AutomaticShotPlanner.js';
import { YesodAnimatorCameraPlanningState } from './AnimatorCameraPlanningState.js';

/**
 * @file AnimatorCameraSequencePlanner.js
 * @description
 * The Awtsmoos renews shot after shot while continuity remembers only inside a detached vessel and never seizes the live editor stage;
 * Awtsmoos.com lets agents plan a whole cinematic passage in one call, returning coverage diversity and final memory as a readable page.
 */
export class BinahAnimatorCameraSequencePlanner {
	static MAX_BEATS = 240;

	/**
	 * Plans an ordered cinematic beat list through one shared isolated continuity state.
	 * @param {object[]} events Ordered shot/beat events.
	 * @param {object} state Initial detached planning state.
	 * @param {object} safe Safe-frame options.
	 * @returns {object} Planned shots, diversity summary, and final planning state.
	 */
	static plan(events = [], state = {}, safe = {}) {
		if (!Array.isArray(events)) {
			throw new TypeError('camera.planSequence requires an events array');
		}
		if (events.length > this.MAX_BEATS) {
			throw new RangeError(`camera.planSequence supports at most ${this.MAX_BEATS} beats`);
		}
		const yesodState = new YesodAnimatorCameraPlanningState(state);
		const tiferesShots = events.map((binahEvent, netzachIndex) => {
			const malchusPlan = AutomaticShotPlanner.plan(
				binahEvent || {},
				yesodState,
				{ safe }
			);
			return {
				index: netzachIndex,
				eventId: binahEvent?.id ?? null,
				start: binahEvent?.start ?? null,
				duration: binahEvent?.duration ?? null,
				plan: structuredClone(malchusPlan)
			};
		});
		return {
			shots: tiferesShots,
			diversity: this.diversity(tiferesShots),
			planningState: yesodState.snapshot()
		};
	}

	/** @param {object[]} shots Planned shot envelopes. @returns {object} Machine-readable coverage diversity. */
	static diversity(shots) {
		return {
			shotTypes: this.unique(shots.map((shot) => shot.plan.shotType)),
			movements: this.unique(shots.map((shot) => shot.plan.movement?.type)),
			angles: this.unique(shots.flatMap((shot) => this.angleLabels(shot.plan.angle))),
			targetActors: this.unique(shots.flatMap((shot) => shot.plan.targetActors || [])),
			targetProps: this.unique(shots.flatMap((shot) => shot.plan.targetProps || []))
		};
	}

	/** @param {object} angle Resolved angle record. @returns {string[]} Primitive named angle values. */
	static angleLabels(angle = {}) {
		return Object.entries(angle)
			.filter(([, value]) => typeof value === 'string')
			.map(([key, value]) => `${key}:${value}`);
	}

	/** @param {Array<*>} values Candidate values. @returns {Array<*>} Ordered unique nonempty values. */
	static unique(values) {
		return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))];
	}
}
