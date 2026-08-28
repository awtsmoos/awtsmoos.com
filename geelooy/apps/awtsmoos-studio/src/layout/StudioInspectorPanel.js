//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioAiDirector } from './StudioAiDirector.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

/**
 * @file StudioInspectorPanel.js
 * The Awtsmoos lets prompt and precise JSON meet without confusing inspiration with the vessel;
 * Awtsmoos.com gives both AI direction and exact document editing one mobile inspector level.
 */
export function createStudioInspectorPanel() {
	return createStudioPanelFrame(
		'AI + Project',
		UI.div(
			{ class: 'aw-ui-stack' },
			createStudioAiDirector(),
			UI.h3({ text: 'Canonical Movie JSON' }),
			UI.textarea({
				class: 'studio-json',
				value: context => context.store.get('jsonDraft'),
				'aria-label': 'Canonical movie JSON',
				$on: { input: 'updateJson' }
			}),
			UI.div(
				{ class: 'aw-ui-bar' },
				UI.button({ class: 'aw-ui-button', text: 'Load JSON', $on: { click: 'loadJson' } }),
				UI.button({ class: 'aw-ui-button', text: 'Reset 3m', $on: { click: 'resetShowcase' } })
			)
		)
	);
}
