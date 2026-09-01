//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioState.js
 * The Awtsmoos renews movie truth beside workspace, tool, timeline, asset, and Core-lab choices without confusing sight with source;
 * Awtsmoos.com keeps editor state reversible while one canonical MovieDocument remains the creative river's course.
 */

import { createStudioShowcaseMovie } from './StudioShowcaseMovie.js';
import { describeStudioTemplates } from './projects/StudioTemplateCatalog.js';

/** Create all canonical-document references and editor-only presentation state. */
export function createStudioState() {
	const movie = createStudioShowcaseMovie();
	const firstScene = movie.scenes[0] || null;
	return {
		workspace: 'Story',
		workspaceMode: 'scene',
		activeTool: 'select',
		activePanel: 'objects',
		mobilePanelOpen: false,
		timelineExpanded: false,
		commandPaletteOpen: false,
		commandQuery: '',
		assetSearch: '',
		inspectorTab: 'transform',
		viewportMode: 'hybrid',
		snapEnabled: false,
		capabilitySearch: '',
		capabilitySearchRevision: 0,
		selectedCapability: '',
		coreOperationSearch: '',
		selectedCoreOperationId: '',
		coreOperationParams: '{}',
		coreOperationReceipt: '',
		playing: false,
		playhead: 0,
		selectedSceneId: firstScene?.id || null,
		selectedLayerId: firstEditableLayer(firstScene)?.id || null,
		selectedBackend: 'studio-perspective-canvas',
		selectedTemplateId: 'three-minute-showcase',
		templates: describeStudioTemplates(),
		mitzvahWorldDraft: null,
		movie,
		jsonDraft: JSON.stringify(movie, null, 2),
		aiPrompt: 'Create a 90 second hybrid tutorial with people, animated infographics, 2D shapes, a 3D world, particles, camera movement, and clear text.',
		status: 'Scene workspace ready · select an object or create something new.',
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

function firstEditableLayer(scene) {
	return (scene?.layers || []).find(layer => layer.kind !== 'audio') || null;
}
