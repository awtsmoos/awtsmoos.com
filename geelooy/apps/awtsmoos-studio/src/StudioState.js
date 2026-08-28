//B"H
// Boruch Hashem
// Blessed is He

import { createStudioShowcaseMovie } from './StudioShowcaseMovie.js';

/**
 * @file StudioState.js
 * The Awtsmoos holds one movie truth while many workspaces reveal different light;
 * Awtsmoos.com keeps prompt, project, playhead, and capability state together without losing sight.
 */
export function createStudioState() {
	const movie = createStudioShowcaseMovie();
	return {
		workspace: 'Story',
		playing: false,
		playhead: 0,
		selectedSceneId: movie.scenes[0]?.id || null,
		movie,
		jsonDraft: JSON.stringify(movie, null, 2),
		aiPrompt: 'Create a 90 second hybrid tutorial with people, animated infographics, 2D shapes, a 3D world, particles, camera movement, and clear text.',
		status: 'Canonical 180-second showcase loaded.',
		capabilities: {
			sharedMovie: false,
			proceduralCore: false,
			nativeAssetSystems: [],
			portableAssetTypes: [],
			studios: {}
		}
	};
}

export const STUDIO_WORKSPACES = ['Story', '2D', '3D', 'Infographic', 'Tutorial', 'Procedural', 'Render'];
