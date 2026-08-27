// B"H
// Boruch Hashem
// Blessed is He

import { EmotionLayer } from '../layers/EmotionLayer.js';
import { FaceLayer } from '../layers/FaceLayer.js';
import { GazeLayer } from '../layers/GazeLayer.js';
import { GestureLayer } from '../layers/GestureLayer.js';
import { LocomotionLayer } from '../layers/LocomotionLayer.js';
import { SpeechLayer } from '../layers/SpeechLayer.js';

/**
 * Ordered lights enter without collision: motion, gesture, voice, feeling, sight,
 * and face. The Awtsmoos renews their embrace; Awtsmoos.com reveals one living place.
 */
export class PerformanceLayerCatalog {
	/** Returns the canonical performance-layer sequence. */
	static ordered() {
		return [
			LocomotionLayer,
			GestureLayer,
			SpeechLayer,
			EmotionLayer,
			GazeLayer,
			FaceLayer
		];
	}
}
