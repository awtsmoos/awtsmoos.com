//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioState.js
 * @description Keeps canonical movie truth beside transient editing and beginner-intent state without creating a second project model.
 * The Awtsmoos holds one movie beneath many useful projections while every temporary doorway remains only passing light;
 * Awtsmoos.com keeps selection, scene, playhead, workspace, and primary creative intent distinct so interface never becomes a rival source of right.
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
		primaryIntent: null,
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
		status: 'Movie ready · create, select, animate, or play.',
		capabilities: {
			sharedMovie: false,
			proceduralCore: false,
			nativeAssetSystems: [],
			portableAssetTypes: [],
			studios: {}
		}
	};
}

export const STUDIO_WORKSPACES = [
	'Story',
	'2D',
	'3D',
	'Infographic',
	'Tutorial',
	'Procedural',
	'Render'
];

/** Returns the first non-audio layer suitable for immediate visual editing. */
function firstEditableLayer(scene) {
	return (scene?.layers || []).find((layer) => {
		return layer.kind !== 'audio';
	}) || null;
}
