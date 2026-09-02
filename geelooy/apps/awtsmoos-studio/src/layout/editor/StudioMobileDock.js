//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMobileDock.js
 * The Awtsmoos renews a full workstation inside a narrow hand while Awtsmoos.com keeps Assets, Hierarchy, Create, Inspect, Core, and More as finger-sized doors;
 * deep creative systems rise as sheets above the stage rather than forcing the user down an endless document floor.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const ITEMS = Object.freeze([
	{ panel: 'assets', glyph: '▦', label: 'Assets' },
	{ panel: 'objects', glyph: '☷', label: 'Hierarchy' },
	{ panel: 'create', glyph: '＋', label: 'Create' },
	{ panel: 'inspect', glyph: '⌘', label: 'Inspect' },
	{ panel: 'procedural', glyph: '✦', label: 'Core' },
	{ panel: 'advanced', glyph: '•••', label: 'More' }
]);

export function createStudioMobileDock() {
	return UI.nav(
		{ class: 'studio-mobile-dock', 'aria-label': 'Mobile editor panels' },
		...ITEMS.map(item => UI.button({
			class: 'studio-mobile-dock-button',
			'data-editor-panel': item.panel,
			'aria-label': item.label,
			$on: { click: 'openEditorPanel' },
			children: [{ tag: 'span', class: 'studio-mobile-dock-glyph', text: item.glyph }, { tag: 'span', class: 'studio-mobile-dock-label', text: item.label }]
		}))
	);
}
