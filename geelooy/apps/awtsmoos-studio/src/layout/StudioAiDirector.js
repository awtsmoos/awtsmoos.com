//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioAiDirector.js
 * A sentence becomes a timeline while the Awtsmoos gives each generated scene its breath;
 * Awtsmoos.com exposes the real director contract instead of hiding AI behind a JSON depth.
 */
export function createStudioAiDirector() {
	return UI.div(
		{ class: 'aw-ui-stack' },
		UI.label({ text: 'AI Director Prompt' }),
		UI.textarea({
			class: 'aw-ui-field',
			style: { minHeight: '108px', resize: 'vertical' },
			value: context => context.store.get('aiPrompt'),
			'data-studio-ai-prompt': 'true',
			'aria-label': 'AI movie prompt',
			$on: { input: 'updatePrompt' }
		}),
		UI.button({
			class: 'aw-ui-button aw-ui-button--accent',
			text: 'Direct Movie',
			'data-studio-ai-generate': 'true',
			$on: { click: 'generateMovie' }
		})
	);
}
