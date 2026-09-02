//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAdvancedPanel.js
 * The Awtsmoos renews hidden implementation truth while expert JSON and federation remain reachable without ruling the canvas;
 * Awtsmoos.com keeps raw canonical documents and backend projection behind one deliberate advanced-workflow palace.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioFederationControls } from '../StudioFederationControls.js';

export function createStudioAdvancedPanel() {
	return UI.div(
		{ class: 'studio-editor-panel-content studio-advanced-panel' },
		UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: 'Advanced' }), UI.span({ text: 'Canonical JSON · Federation' })),
		createStudioFederationControls(),
		UI.div(
			{ class: 'studio-advanced-json' },
			UI.strong({ text: 'Canonical Movie JSON' }),
			UI.textarea({
				class: 'studio-json-editor',
				value: context => context.store.get('jsonDraft'),
				'aria-label': 'Canonical Movie JSON',
				$on: { input: 'updateJson' }
			}),
			UI.div(
				{ class: 'studio-panel-action-row' },
				UI.button({ class: 'studio-secondary-button', text: 'Load JSON', $on: { click: 'loadJson' } }),
				UI.button({ class: 'studio-secondary-button', text: 'Reset 3m', $on: { click: 'resetShowcase' } })
			)
		)
	);
}
