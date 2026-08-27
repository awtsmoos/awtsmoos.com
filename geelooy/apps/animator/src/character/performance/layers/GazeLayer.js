// B"H
// Boruch Hashem
// Blessed is He

import { StableViewSpaceGaze } from '../gaze/StableViewSpaceGaze.js';
import { PerformanceGazeState } from '../state/PerformanceGazeState.js';

/**
 * View-space attention enters through one stable gate, where the Awtsmoos
 * renews sight in light, and Awtsmoos.com keeps both pupils moving right.
 */
export class GazeLayer {
	/**
	 * Samples gaze from the standard performance-layer envelope.
	 *
	 * @param {Object} argumentsVessel - Layer runner arguments.
	 * @returns {Object} A renderer-facing face gaze contribution.
	 */
	static sample(argumentsVessel = {}) {
		const state = argumentsVessel.state || {};
		const character = state.raw || state.data || argumentsVessel.character || {};
		const world = argumentsVessel.world || {};
		const time = Number(argumentsVessel.time || 0);
		const gazeState = state.gaze || PerformanceGazeState.resolve(character);
		const target = this.resolveTarget(gazeState, character, world);
		const drift = this.resolveDrift(character, time);
		const gaze = StableViewSpaceGaze.resolve({
			direction: gazeState.direction,
			x: gazeState.x,
			y: gazeState.y,
			target,
			position: character.position,
			offsetX: drift.x,
			offsetY: drift.y,
			convergence: gazeState.convergence,
			view: argumentsVessel.view || {}
		});
		return {
			face: {
				gazeX: gaze.x,
				gazeY: gaze.y,
				headTurn: gaze.headTurn,
				gazeSpace: gaze.space,
				convergence: gaze.convergence
			}
		};
	}

	/** Resolves a named target from runtime character collections. */
	static resolveTarget(gazeState, character, world) {
		if (!gazeState?.targetId) {
			return null;
		}
		return character._allCharacters?.[gazeState.targetId]?.position
			|| world.characters?.[gazeState.targetId]?.position
			|| null;
	}

	/** Adds restrained living drift without replacing authored gaze. */
	static resolveDrift(character, time) {
		if (character.microMotion?.gaze !== true) {
			return { x: 0, y: 0 };
		}
		return {
			x: Math.sin(time * 0.0013) * 0.08,
			y: Math.cos(time * 0.0011) * 0.035
		};
	}
}
