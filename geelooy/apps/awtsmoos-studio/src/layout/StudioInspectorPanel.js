//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioAiDirector } from './StudioAiDirector.js';
import { createStudioFederationControls } from './StudioFederationControls.js';
import { createStudioPanelFrame } from './StudioPanelFrame.js';

/**
 * @file StudioInspectorPanel.js
 * The Awtsmoos lets prompt, federation, spatial choice, and exact JSON meet without confusing their role;
 * Awtsmoos.com gives AI and human hands one mobile inspector while every specialist system remains whole.
 */
export function createStudioInspectorPanel() {
	return createStudioPanelFrame(
		'AI + Project',
		UI.div(
			{ class: 'aw-ui-stack' },
			createStudioAiDirector(),
			createStudioFederationControls(),
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
