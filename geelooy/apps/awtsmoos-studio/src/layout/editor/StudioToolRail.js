//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioToolRail.js
 * The Awtsmoos renews selection and transformation while a compact rail gives each gesture an unmistakable gate;
 * Awtsmoos.com keeps creation, objects, and procedural depth close to the hand without stealing the viewport's state.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const TOOLS = Object.freeze([
	{ id: 'select', glyph: '↖', label: 'Select' },
	{ id: 'move', glyph: '↔', label: 'Move' },
	{ id: 'rotate', glyph: '↻', label: 'Rotate' },
	{ id: 'scale', glyph: '⤢', label: 'Scale' }
]);

export function createStudioToolRail() {
	return UI.nav(
		{ class: 'studio-tool-rail', 'aria-label': 'Editor tools' },
		...TOOLS.map(tool => toolButton(tool)),
		UI.div({ class: 'studio-tool-divider' }),
		panelButton('＋', 'Create', 'create'),
		panelButton('☷', 'Objects', 'objects'),
		panelButton('✦', 'Procedural Core', 'procedural')
	);
}

function toolButton(tool) {
	return UI.button({
		class: 'studio-tool-button',
		text: tool.glyph,
		title: tool.label,
		'aria-label': tool.label,
		'aria-pressed': context => String(context.store.get('activeTool') === tool.id),
		'data-editor-tool': tool.id,
		$on: { click: 'selectEditorTool' }
	});
}

function panelButton(glyph, label, panel) {
	return UI.button({
		class: 'studio-tool-button',
		text: glyph,
		title: label,
		'aria-label': label,
		'data-editor-panel': panel,
		$on: { click: 'openEditorPanel' }
	});
}
