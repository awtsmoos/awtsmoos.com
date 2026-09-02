//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioOutliner.js
 * The Awtsmoos renews many layers inside one scene while an outliner gives each object a name the hand can find;
 * Awtsmoos.com keeps selection, duplication, and deletion beside the canvas instead of hiding structure in JSON behind.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioScene } from '../../editor/StudioLayerAccess.js';

export function createStudioOutliner() {
	const row = {
		tag: 'button',
		class: 'studio-outliner-row',
		'data-layer-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedLayerId') === context.data.item.id),
		$on: { click: 'selectEditorLayer' },
		children: [
			{ tag: 'span', class: 'studio-outliner-kind', text: context => glyphFor(context.data.item.kind) },
			{ tag: 'span', class: 'studio-outliner-name', text: context => context.data.item.id },
			{ tag: 'span', class: 'studio-outliner-type', text: context => context.data.item.kind }
		]
	};
	return UI.div(
		{ class: 'studio-editor-panel-content' },
		panelHeading('Objects', context => sceneLabel(context)),
		UI.div({ class: 'studio-outliner-list' }, {
			...row,
			$each: { items: context => getStudioScene(context.store.get('movie'), context.store.get('selectedSceneId'))?.layers || [] }
		}),
		UI.div(
			{ class: 'studio-panel-action-row' },
			UI.button({ class: 'studio-secondary-button', text: 'Duplicate', $on: { click: 'duplicateEditorLayer' } }),
			UI.button({ class: 'studio-danger-button', text: 'Delete', $on: { click: 'deleteEditorLayer' } })
		)
	);
}

function panelHeading(title, subtitle) {
	return UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: title }), UI.span({ text: subtitle }));
}

function sceneLabel(context) {
	const scene = getStudioScene(context.store.get('movie'), context.store.get('selectedSceneId'));
	return scene ? `${scene.name} · ${(scene.layers || []).length}` : 'No scene';
}

function glyphFor(kind) {
	if (String(kind).includes('3d')) return '◇';
	if (String(kind).includes('audio') || ['music', 'sfx', 'dialogue', 'narration'].includes(kind)) return '♪';
	return '◆';
}
