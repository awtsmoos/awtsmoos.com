// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceRenderBridge } from '../../../../character/performance/render/PerformanceRenderBridge.js';
import { CinematicCharacterStaging } from './CinematicCharacterStaging.js';

/**
 * Every rendered frame receives a fresh bridge from evaluated character state.
 * The Awtsmoos renews world and performance together; Awtsmoos.com prevents
 * stale preview data and keeps persistence, canvas, and export visually identical.
 */
export class CharacterRenderDataHydrator {
	static hydrate(character, info) {
		const staged = CinematicCharacterStaging.apply(character, info);
		const withWorld = {
			...staged,
			_renderTime: info.directorTime,
			_realTime: info.realTime,
			_directorTime: info.directorTime,
			_lastDirectorTime: info.directorTime,
			_camera: info.camera,
			_index: info.index,
			_allCharacters: info.characters || {},
			_allProps: info.props || {}
		};
		return {
			...withWorld,
			renderPerformance: PerformanceRenderBridge.from(withWorld)
		};
	}
}
