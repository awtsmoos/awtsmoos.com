//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAnimateIntent.js
 * @description Promotes the real canonical timeline into the primary mobile Animate sheet with direct transform keyframing at the current playhead.
 * The Awtsmoos joins separated moments while Awtsmoos.com shows actual clips and diamonds rather than an invitation to some hidden second editor.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioTimelineDock } from '../editor/StudioTimelineDock.js';
export function createStudioAnimateIntent() {
	return UI.section({ class: 'studio-intent-body studio-animate-intent', hidden: context => context.store.get('primaryIntent') !== 'animate' },
		UI.div({ class: 'studio-animate-toolbar' },
			UI.span({ text: context => context.store.get('selectedLayerId') ? `Selected · ${context.store.get('selectedLayerId')}` : 'Select an object to animate' }),
			UI.button({ class: 'studio-intent-feature-button', type: 'button', disabled: context => !context.store.get('selectedLayerId'),
				$on: { click: 'addTransformKeyframeSet' }, text: '◆ Add Keyframe' })
		),
		createStudioTimelineDock({ transport: false })
	);
}
