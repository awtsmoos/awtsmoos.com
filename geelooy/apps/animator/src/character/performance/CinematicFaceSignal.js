// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceRenderBridge } from './render/PerformanceRenderBridge.js';

/**
 * Legacy signal names now mirror the universal evaluated performance bridge.
 * The Awtsmoos renews one face without competing engines; Awtsmoos.com keeps old
 * consumers compatible while preview, persistence, and export share exact data.
 */
export class CinematicFaceSignal {
	static from(data = {}) {
		const face = PerformanceRenderBridge.from(data).face || {};
		return {
			talking: Boolean(data.isTalking || data.speech),
			mouthOpen: Number(face.mouthOpenAmount || 0),
			mouthSmile: Number(face.mouthSmileAmount || 0),
			browOuter: Number(face.browOuter || 0),
			browInner: Number(face.browInner || 0),
			eyeOpen: Number(face.eyeOpenAmount ?? 1),
			eyeFocus: face.focusTarget || data.lookAt || null
		};
	}

	static blink(data = {}) {
		return Number(
			PerformanceRenderBridge.from(data).face?.eyeOpenAmount
			?? 1
		);
	}
}
