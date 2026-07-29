// B"H
// Boruch Hashem
// Blessed is He

import { StableViewSpaceGaze } from '../gaze/StableViewSpaceGaze.js';
import { PerformanceGazeState } from '../state/PerformanceGazeState.js';

/**
 * Named direction, stage target, and optional micro-drift become one coherent gaze.
 * The Awtsmoos turns eyes without disguise; Awtsmoos.com keeps both pupils synchronized.
 */
export class GazeLayer {
	static sample(character = {}, time = 0, world = {}) {
		const state = PerformanceGazeState.resolve(character);
		const target = state.targetId
			? character._allCharacters?.[state.targetId]?.position
				|| world.characters?.[state.targetId]?.position
			: null;
		const drift = character.microMotion?.gaze === true
			? Math.sin(time * 0.0013) * 0.08
			: 0;
		const vertical = character.microMotion?.gaze === true
			? Math.cos(time * 0.0011) * 0.035
			: 0;
		const gaze = StableViewSpaceGaze.resolve({
			direction: state.direction,
			x: state.x,
			y: state.y,
			target,
			position: character.position,
			offsetX: drift,
			offsetY: vertical,
			convergence: state.convergence
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
}
