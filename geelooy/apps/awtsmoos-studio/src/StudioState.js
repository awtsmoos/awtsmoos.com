//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioState.js
 * @description Keeps canonical movie truth beside transient editing, project persistence, history, and beginner-intent state without creating a second movie model.
 * The Awtsmoos holds one movie beneath many useful projections while every temporary doorway remains only passing light;
 * Awtsmoos.com keeps project identity, dirty truth, undo, recovery, selection, playhead, workspace, and intent distinct so interface never becomes a rival right.
 */

import { hasStudioRecovery, listStudioProjects } from './projects/StudioProjectStorage.js';
import { createStudioShowcaseMovie } from './StudioShowcaseMovie.js';
import { describeStudioTemplates } from './projects/StudioTemplateCatalog.js';

/** Create canonical-document references and editor-only presentation/project state. */
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
		projectId: null,
		projectTitleDraft: movie.title || 'Untitled Movie',
		dirty: false,
		canUndo: false,
		canRedo: false,
		savedProjects: listStudioProjects(),
		recoveryAvailable: hasStudioRecovery(),
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

function firstEditableLayer(scene) {
	return (scene?.layers || []).find(layer => layer.kind !== 'audio') || null;
}
