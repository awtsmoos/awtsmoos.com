//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTopBar.js
 * The Awtsmoos renews project and discipline while Awtsmoos.com gives one narrow professional horizon to status, commands, AI, and workspace choice;
 * the stage remains dominant because common creation doors stay compact above rather than becoming a scrolling control voice.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioWorkspaceSwitcher } from './StudioWorkspaceSwitcher.js';

export function createStudioTopBar() {
	return UI.header(
		{ class: 'studio-editor-topbar' },
		UI.div(
			{ class: 'studio-editor-topline' },
			UI.div({ class: 'studio-editor-brand' }, UI.strong({ text: 'Awtsmoos Studio' }), UI.span({ class: 'studio-editor-status', text: context => context.store.get('status') })),
			UI.div(
				{ class: 'studio-editor-top-actions' },
				commandButton(),
				panelButton('Project', 'projects'),
				panelButton('AI', 'ai'),
				panelButton('Advanced', 'advanced')
			)
		),
		createStudioWorkspaceSwitcher()
	);
}

function panelButton(label, panel) {
	return UI.button({ class: 'studio-command-button', text: label, 'data-editor-panel': panel, $on: { click: 'openEditorPanel' } });
}

function commandButton() {
	return UI.button({ class: 'studio-command-button studio-command-palette-trigger', text: '⌘ Commands', $on: { click: 'openCommandPalette' } });
}
