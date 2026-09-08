//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioState.js
 * @description Keeps canonical movie truth beside transient editing, project memory, export presentation, audio meaning, history, and beginner intent without creating a second movie model.
 * The Awtsmoos holds one movie beneath many useful projections; Awtsmoos.com keeps export choices, selection, time, project identity, recovery, and capability state as passing interface light around that one truth.
 */
import { hasStudioRecovery, listStudioProjects } from './projects/StudioProjectStorage.js';
import { createStudioShowcaseMovie } from './StudioShowcaseMovie.js';
import { describeStudioTemplates } from './projects/StudioTemplateCatalog.js';
export function createStudioState() {
	const movie = createStudioShowcaseMovie();
	const firstScene = movie.scenes[0] || null;
	return {
		workspace: 'Story', workspaceMode: 'scene', primaryIntent: null,
		activeTool: 'select', editTransformMode: 'position', activePanel: 'objects', mobilePanelOpen: false, timelineExpanded: false,
		commandPaletteOpen: false, commandQuery: '', assetSearch: '', audioImportKind: 'music', inspectorTab: 'transform',
		exportOpen: false, exportResolution: '1080p', exportFps: 30, exportIncludeAudio: true,
		exporting: false, exportProgress: 0, exportStatus: 'Ready to render the current movie.',
		viewportMode: 'hybrid', snapEnabled: false, capabilitySearch: '', capabilitySearchRevision: 0,
		selectedCapability: '', coreOperationSearch: '', selectedCoreOperationId: '', coreOperationParams: '{}', coreOperationReceipt: '',
		playing: false, playhead: 0,
		selectedSceneId: firstScene?.id || null,
		selectedLayerId: firstEditableLayer(firstScene)?.id || null,
		selectedBackend: 'studio-perspective-canvas', selectedTemplateId: 'three-minute-showcase',
		templates: describeStudioTemplates(), projectId: null, projectTitleDraft: movie.title || 'Untitled Movie',
		dirty: false, canUndo: false, canRedo: false,
		savedProjects: listStudioProjects(), recoveryAvailable: hasStudioRecovery(), mitzvahWorldDraft: null,
		movie, jsonDraft: JSON.stringify(movie, null, 2),
		aiPrompt: 'Create a 90 second hybrid tutorial with people, animated infographics, 2D shapes, a 3D world, particles, camera movement, and clear text.',
		status: 'Movie ready · create, select, animate, or play.',
		capabilities: { sharedMovie: false, proceduralCore: false, nativeAssetSystems: [], portableAssetTypes: [], studios: {} }
	};
}
export const STUDIO_WORKSPACES = ['Story', '2D', '3D', 'Infographic', 'Tutorial', 'Procedural', 'Render'];
function firstEditableLayer(scene) { return (scene?.layers || []).find(layer => layer.kind !== 'audio') || null; }
