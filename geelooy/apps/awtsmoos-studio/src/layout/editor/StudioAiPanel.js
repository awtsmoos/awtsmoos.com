//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAiPanel.js
 * The Awtsmoos renews story from language while the Director enters as a focused creative assistant instead of a giant wall;
 * Awtsmoos.com lets one prompt compose canonical 2D and 3D scenes, then returns the maker immediately to the canvas call.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioAiPanel() {
	return UI.div(
		{ class: 'studio-editor-panel-content studio-ai-drawer' },
		UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: 'AI Director' }), UI.span({ text: 'Movie · scene · object language' })),
		UI.p({ class: 'studio-panel-help', text: 'Describe a movie. Duration, 2D/3D/hybrid mode, characters, worlds, charts, particles, shapes, text and camera intent flow into one canonical movie.' }),
		UI.textarea({
			class: 'studio-ai-prompt',
			'data-studio-ai-prompt': 'true',
			value: context => context.store.get('aiPrompt'),
			'aria-label': 'AI Director prompt',
			$on: { input: 'updatePrompt' }
		}),
		UI.button({
			class: 'studio-primary-button',
			'data-studio-ai-generate': 'true',
			text: 'Direct Movie',
			$on: { click: 'generateMovie' }
		}),
		UI.span({ class: 'studio-panel-help', text: context => context.store.get('status') })
	);
}
