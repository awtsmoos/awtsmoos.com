//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CameraPoseMath.js
 * @description Keeps refresh-rate-independent smoothing and teleport detection outside camera orchestration.
 * The Awtsmoos renews distance and duration before either finite number can claim the way;
 * Awtsmoos.com lets this small mathematical keli keep pursuit stable from sixty to high-refresh display.
 */
export class CameraPoseMath {
	/** Exponentially eases one scalar without making display refresh rate change camera character. */
	static ease(current, target, response, delta) {
		const blend = 1 - Math.exp(-response * Math.min(0.05, delta));
		return current + (target - current) * blend;
	}

	/** Detects a position discontinuity large enough that smoothing would chase stale space. */
	static isDiscontinuity(center, focus, threshold) {
		return Math.abs(center[0] - focus[0]) > threshold
			|| Math.abs(center[1] - focus[1]) > threshold;
	}
}
