// B"H
// Boruch Hashem
// Blessed is He

import { StrideDisplacementSolver } from '../../../../character/animation/gait/StrideDisplacementSolver.js';

/**
 * World travel moves the hidden rig without contaminating facial expression.
 * The Awtsmoos renews each road and pace; Awtsmoos.com now gives gait the measured
 * journey distance it needs to plant feet while preserving director ownership.
 */
export class CharacterTravelProcessor {
	/**
	 * Projects one directed travel event into runtime character state.
	 * Mutates only the supplied character and publishes normalized progress plus
	 * total/covered distance for downstream gait calibration.
	 *
	 * @param {Object} character - Mutable runtime character state.
	 * @param {Object} event - Directed event containing from/to positions.
	 * @param {number} progress - Event progress, normally 0..1.
	 * @returns {void}
	 */
	static apply(character, event = {}, progress = 0) {
		if (!event.pos?.from || !event.pos?.to) {
			character._travelProgress = 0;
			character._travelDistance = 0;
			character._travelDistanceCovered = 0;
			return;
		}
		const normalized = this.clampProgress(progress);
		const oldX = Number(character.position.x || event.pos.from.x || 0);
		const sampled = StrideDisplacementSolver.sample(
			event.pos.from,
			event.pos.to,
			normalized
		);
		character.position = { ...character.position, ...sampled };
		const newX = Number(character.position.x || 0);
		const distance = this.distance(event.pos.from, event.pos.to);
		character._travelDirection = this.direction(
			oldX,
			newX,
			character._travelDirection
		);
		character.locomotion = event.locomotion || event.action || 'walk';
		character.motionMode = 'worldTravel';
		character.acting = character.locomotion;
		character._travelProgress = normalized;
		character._travelDistance = distance;
		character._travelDistanceCovered = distance * normalized;
		character.directorTime = Number(event.start || 0)
			+ (Number(event.end || 0) - Number(event.start || 0)) * normalized;
		this.applyFacing(character, event, oldX, newX);
	}

	/** @param {Object} from @param {Object} to @returns {number} Euclidean 2D distance. */
	static distance(from = {}, to = {}) {
		return Math.hypot(
			Number(to.x || 0) - Number(from.x || 0),
			Number(to.y || 0) - Number(from.y || 0)
		);
	}

	/** @param {number} value @returns {number} Clamped event progress. */
	static clampProgress(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	/** @param {number} oldX @param {number} newX @param {number} previous @returns {number} */
	static direction(oldX, newX, previous = 1) {
		if (newX === oldX) return previous || 1;
		return newX > oldX ? 1 : -1;
	}

	/** @param {Object} character @param {Object} event @param {number} oldX @param {number} newX */
	static applyFacing(character, event, oldX, newX) {
		if (event.view) return;
		character.view = Math.abs(newX - oldX) > 8
			? 'side'
			: character.view || 'threeQuarter';
		character.flipX = character._travelDirection < 0;
	}
}
