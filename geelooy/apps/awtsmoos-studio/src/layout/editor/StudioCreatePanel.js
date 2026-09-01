//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCreatePanel.js
 * The Awtsmoos renews shape, voice, person, data, world, and camera while creation begins with one semantic choice;
 * Awtsmoos.com turns canonical movie kinds into touchable tools so makers need no raw JSON to rejoice.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_CREATE_ITEMS } from '../../editor/StudioCreateCatalog.js';

export function createStudioCreatePanel() {
	const card = {
		tag: 'button',
		class: 'studio-create-card',
		'data-layer-kind': context => context.data.item.kind,
		$on: { click: 'createEditorLayer' },
		children: [
			{ tag: 'span', class: 'studio-create-icon', text: context => iconFor(context.data.item.kind) },
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', class: 'studio-create-category', text: context => context.data.item.category }
		]
	};
	return UI.div(
		{ class: 'studio-editor-panel-content' },
		UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: 'Create' }), UI.span({ text: `${STUDIO_CREATE_ITEMS.length} semantic tools` })),
		UI.div({ class: 'studio-create-grid' }, { ...card, $each: { items: STUDIO_CREATE_ITEMS } })
	);
}

function iconFor(kind) {
	if (String(kind).includes('3d')) return '◇';
	if (kind === 'text' || kind === 'caption') return 'T';
	if (kind === 'chart' || kind === 'data') return '▥';
	if (String(kind).includes('audio') || ['music', 'sfx', 'dialogue', 'narration'].includes(kind)) return '♪';
	if (String(kind).includes('particle')) return '✣';
	if (String(kind).includes('character')) return '♙';
	return '◆';
}
