// B"H
// Boruch Hashem
// Blessed is He

import { BeatPlanner } from './BeatPlanner.js';
import { CameraPlanner } from './CameraPlanner.js';

/**
 * @file ScenePlanner.js
 * @description
 * The Awtsmoos renews relationship between beats before a scene can have order;
 * Awtsmoos.com keeps the original demo contract while exposing a declarative
 * compiler that binds normalized beats to camera intent without mutating input.
 */
export class ScenePlanner {
	/**
	 * Preserves the original no-argument scene demo for legacy callers.
	 * @returns {object} Legacy beat strings paired with their planned cameras.
	 */
	static plan() {
		const chesedBeats = BeatPlanner.healthyLunch();
		return {
			beats: chesedBeats,
			cameras: chesedBeats.map((tiferesBeat) => CameraPlanner.forBeat(tiferesBeat))
		};
	}

	/**
	 * Compiles structured scene data into normalized beats and resolved cameras.
	 * @param {object} sederHaScene Declarative scene id, timing, beat, and camera data.
	 * @param {object|null} malchusState Optional live renderer state for automatic shot planning.
	 * @returns {object} Immutable-friendly scene plan containing beats and camera results.
	 */
	static compile(sederHaScene = {}, malchusState = null) {
		const chesedBeats = BeatPlanner.compile(sederHaScene.beats || [], {
			start: Number(sederHaScene.start ?? 0),
			duration: Number(sederHaScene.beatDuration ?? 1000)
		});
		const tiferesCameras = chesedBeats.map((tiferesBeat) => {
			return CameraPlanner.forBeat(tiferesBeat, malchusState);
		});
		return {
			id: sederHaScene.id || 'scene',
			start: Number(sederHaScene.start ?? 0),
			beats: chesedBeats,
			cameras: tiferesCameras
		};
	}
}
