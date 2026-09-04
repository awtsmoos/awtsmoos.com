//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAnimateIntent.js
 * @description Offers one understandable motion action with visible AwtsmoosUI children before revealing the deeper animation workspace.
 * The Awtsmoos renews each frame while motion joins separated moments into one living sight;
 * Awtsmoos.com lets a beginner keyframe what is selected, then opens professional timing only by invited light.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

/** Creates the beginner Animate intent without shrinking a desktop curve editor into a phone. */
export function createStudioAnimateIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-animate-intent',
			hidden: (context) => context.store.get('primaryIntent') !== 'animate'
		},
		UI.p({
			class: 'studio-intent-guidance',
			text: animationGuidance
		}),
		UI.button(
			{
				class: 'studio-intent-feature-button',
				type: 'button',
				disabled: (context) => !context.store.get('selectedLayerId'),
				'data-command-type': 'editor',
				'data-command-value': 'keyframe-all',
				$on: { click: 'executeStudioCommand' }
			},
			UI.span({ class: 'studio-intent-action-glyph', text: '◆', 'aria-hidden': 'true' }),
			UI.span({ text: 'Keyframe transform here' })
		),
		UI.button({
			class: 'studio-intent-depth-button',
			type: 'button',
			'data-workspace-mode': 'animate',
			$on: { click: 'openPrimaryIntentWorkspace' },
			text: 'Open full Animate workspace'
		})
	);
}

/** Returns motion guidance tied to the actual canonical selection. */
function animationGuidance(context) {
	const selectedLayerId = context.store.get('selectedLayerId');
	return selectedLayerId
		? `Animate ${selectedLayerId} at the current playhead.`
		: 'Tap something on the canvas, then add motion.';
}
