//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspector.js
 * The Awtsmoos renews context while Awtsmoos.com gathers transform, timing, animation, compositing, spatial projection, and object operations around the selected layer;
 * Blender/Unity properties and After-Effects animation concepts share one inspector without raw JSON ruling the maker's day.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLayer } from '../../editor/StudioLayerAccess.js';
import { createStudioAnimationInspector } from './StudioAnimationInspector.js';
import { createStudioEffectsInspector } from './StudioEffectsInspector.js';
import { createStudioTimingInspector } from './StudioTimingInspector.js';
import { createStudioTransformInspector } from './StudioTransformInspector.js';

const SPATIAL_MODES = ['screen', 'billboard', 'plane', 'decal', 'texture'];

export function createStudioInspector() {
	return UI.aside(
		{ class: 'studio-editor-inspector', 'data-studio-inspector': 'true' },
		UI.div({ class: 'studio-inspector-heading' }, UI.div({}, UI.strong({ text: context => selectedName(context) }), UI.span({ text: context => selectedKind(context) })), UI.button({ class: 'studio-panel-close', text: 'Done', $on: { click: 'closeMobilePanel' } })),
		createStudioTransformInspector(),
		createStudioTimingInspector(),
		createStudioAnimationInspector(),
		createStudioEffectsInspector(),
		UI.section(
			{ class: 'studio-inspector-section' },
			UI.strong({ text: 'Spatial Projection' }),
			UI.div({ class: 'studio-spatial-grid' }, ...SPATIAL_MODES.map(mode => spatialButton(mode)))
		),
		UI.div({ class: 'studio-panel-action-row studio-inspector-actions' }, UI.button({ class: 'studio-secondary-button', text: 'Duplicate', $on: { click: 'duplicateEditorLayer' } }), UI.button({ class: 'studio-danger-button', text: 'Delete', $on: { click: 'deleteEditorLayer' } }))
	);
}

function spatialButton(mode) {
	return UI.button({ class: 'studio-spatial-button', text: mode[0].toUpperCase() + mode.slice(1), 'data-spatial-mode': mode, 'aria-pressed': context => String((selectedLayer(context)?.spatial?.mode || 'screen') === mode), $on: { click: 'setSpatialMode' } });
}

function selectedLayer(context) {
	return getStudioLayer(context.store.get('movie'), context.store.get('selectedSceneId'), context.store.get('selectedLayerId'));
}

function selectedName(context) {
	return selectedLayer(context)?.id || 'No object selected';
}

function selectedKind(context) {
	return selectedLayer(context)?.kind || 'Choose an object from Hierarchy or Timeline';
}
