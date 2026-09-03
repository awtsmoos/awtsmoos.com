//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPrimaryDock.js
 * @description Gives touch-first makers five truthful primary doors: native Create/Edit/Animate modes plus real Audio and More professional capability bridges.
 * The Awtsmoos lets a small thumb reach the next meaningful creative act without seeing the whole machine at once;
 * Awtsmoos.com keeps simple doors honest while deeper professional rooms remain available through the same living project dance.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

const MODE_ITEMS = Object.freeze([
	item('Create', '＋', '2d'),
	item('Edit', '✎', 'edit'),
	item('Animate', '◆', 'animate')
]);

/** Creates the mobile-first primary creative dock without inventing a second workspace state model. */
export function createStudioPrimaryDock() {
	return UI.nav(
		{
			class: 'studio-primary-dock',
			'aria-label': 'Primary creative tools'
		},
		...MODE_ITEMS.map(createModeButton),
		createProToolButton('Audio', '♪', 'audio'),
		UI.button({
			class: 'studio-primary-dock-button',
			type: 'button',
			$on: { click: 'openProTools' },
			children: dockButtonChildren('More', '•••')
		})
	);
}

/** Creates one button that selects an established Studio workspace mode. */
function createModeButton(entry) {
	return UI.button({
		class: 'studio-primary-dock-button',
		type: 'button',
		'data-workspace-mode': entry.mode,
		'aria-pressed': context => {
			return String(context.store.get('workspaceMode') === entry.mode);
		},
		$on: { click: 'selectWorkspaceMode' },
		children: dockButtonChildren(entry.label, entry.glyph)
	});
}

/** Creates one button that opens an existing lazy professional capability. */
function createProToolButton(label, glyph, toolId) {
	return UI.button({
		class: 'studio-primary-dock-button',
		type: 'button',
		'data-pro-tool': toolId,
		$on: { click: 'openProTool' },
		children: dockButtonChildren(label, glyph)
	});
}

/** Returns the compact glyph/label children shared by every dock button. */
function dockButtonChildren(label, glyph) {
	return [
		UI.span({ class: 'studio-primary-dock-glyph', text: glyph, 'aria-hidden': 'true' }),
		UI.span({ class: 'studio-primary-dock-label', text: label })
	];
}

/** Creates one immutable native-mode item. */
function item(label, glyph, mode) {
	return Object.freeze({ label, glyph, mode });
}
