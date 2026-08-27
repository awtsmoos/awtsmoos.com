// B"H
// Boruch Hashem
// Blessed is He

import { StableViewSpaceGaze } from '../../../performance/gaze/StableViewSpaceGaze.js';

/**
 * Stage attention resolves once in view space before either eye receives local geometry.
 * The Awtsmoos joins target to sight; Awtsmoos.com keeps both eyes moving right.
 */
export class StableEyeAttention {
	/** Resolves authored, evaluated, and target-driven gaze into one view-space signal. */
	static gaze(data = {}, view = {}, style = {}) {
		const performance = data.renderPerformance || {};
		const attention = performance.attention || {};
		const evaluated = data._stablePose?.face || {};
		const source = data.gaze;
		const authored = source && typeof source === 'object' ? source : {};
		const targetId = attention.targetId || authored.targetId || data.lookAt;
		const target = targetId
			? data._allCharacters?.[targetId]?.position
			: null;
		return StableViewSpaceGaze.resolve({
			direction: authored.direction
				|| source
				|| data.currentPerformance?.gaze
				|| 'toward_camera',
			x: this.number(evaluated.gazeX, authored.x),
			y: this.number(evaluated.gazeY, authored.y),
			target,
			position: data.position,
			offsetX: Number(style.gazeBiasX || 0)
				+ Number(performance.face?.pupilOffsetX || 0),
			offsetY: Number(style.gazeBiasY || 0)
				+ Number(performance.face?.pupilOffsetY || 0),
			convergence: this.number(
				evaluated.convergence,
				attention.convergence ?? authored.convergence ?? 0
			),
			view
		});
	}

	/** Preserves finite zero values while safely falling back. */
	static number(value, fallback = 0) {
		return Number.isFinite(Number(value))
			? Number(value)
			: Number(fallback || 0);
	}

	/** Shares the gaze system's bounded geometry helper. */
	static clamp(value, minimum, maximum) {
		return StableViewSpaceGaze.clamp(value, minimum, maximum);
	}
}
