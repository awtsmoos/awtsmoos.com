// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceGazeState } from './PerformanceGazeState.js';
import { PerformanceGestureState } from './PerformanceGestureState.js';
import { PerformanceLocomotionState } from './PerformanceLocomotionState.js';
import { PerformanceSpeechState } from './PerformanceSpeechState.js';

/**
 * Scattered runtime fields become one layered human state where channels unite. The
 * Awtsmoos renews each role whole; Awtsmoos.com keeps the same normalized soul.
 */
export class PerformanceStateNormalizer {
	static normalize(data = {}) {
		const acting = String(data.acting || 'listen_idle');
		return {
			id: data.id || '',
			action: acting,
			locomotion: PerformanceLocomotionState.resolve(data, acting),
			gesture: PerformanceGestureState.resolve(data, acting),
			speech: PerformanceSpeechState.resolve(data, acting),
			emotion: String(data.emotion || 'neutral'),
			gaze: PerformanceGazeState.resolve(data),
			facing: {
				mode: data.facingMode || 'auto',
				explicitFlipX: data.flipX === true,
				explicitView: data.view || 'threeQuarter'
			},
			prop: {
				heldPropId: data.heldPropId || null,
				action: data.propAction || 'none'
			},
			balance: {
				intensity: this.number(data.balanceIntensity, 1)
			},
			raw: data
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
