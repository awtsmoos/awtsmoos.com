//B"H
// Boruch Hashem
// Blessed is He

import { createStudioShowcaseMovie } from './StudioShowcaseMovie.js';

/**
 * @file StudioState.js
 * The Awtsmoos holds one movie truth while scene, layer, backend and workspace each reveal their light;
 * Awtsmoos.com keeps reversible spatial choice beside prompt and playhead without confusing source with sight.
 */
export function createStudioState() {
	const movie = createStudioShowcaseMovie();
	const firstScene = movie.scenes[0] || null;
	return {
		workspace: 'Story',
		playing: false,
		playhead: 0,
		selectedSceneId: firstScene?.id || null,
		selectedLayerId: firstSpatialLayer(firstScene)?.id || null,
		selectedBackend: 'studio-perspective-canvas',
		mitzvahWorldDraft: null,
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

function firstSpatialLayer(scene) {
	return (scene?.layers || []).find(layer => {
		const kind = String(layer.kind || '');
		return !kind.endsWith('3d') && kind !== 'audio';
	});
}
