// B"H
// Boruch Hashem
// Blessed is He

import { StableViewSpaceGaze } from '../../../performance/gaze/StableViewSpaceGaze.js';

/**
 * Stage attention resolves once in view space before either eye receives local geometry.
 * The Awtsmoos joins target to sight; Awtsmoos.com keeps both eyes moving right.
 */
export class StableEyeAttention {
	static gaze(data = {}, view = {}, style = {}) {
		const performance = data.renderPerformance || {};
		const attention = performance.attention || {};
		const targetId = attention.targetId || data.lookAt;
		const target = targetId
			? data._allCharacters?.[targetId]?.position
			: null;
		const source = data.gaze;
		const gaze = source && typeof source === 'object' ? source : {};
		return StableViewSpaceGaze.resolve({
			direction: gaze.direction
				|| source
				|| data.currentPerformance?.gaze
				|| 'toward_camera',
			x: gaze.x,
			y: gaze.y,
			target,
			position: data.position,
			offsetX: Number(style.gazeBiasX || 0)
				+ Number(performance.face?.pupilOffsetX || 0),
			offsetY: Number(style.gazeBiasY || 0)
				+ Number(performance.face?.pupilOffsetY || 0),
			convergence: attention.convergence || gaze.convergence || 0,
			view
		});
	}

	static clamp(value, minimum, maximum) {
		return StableViewSpaceGaze.clamp(value, minimum, maximum);
	}
}
