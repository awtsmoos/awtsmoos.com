//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMoreIntent.js
 * @description Keeps expert systems one truthful layer deeper than the beginner dock while rendering every real destination through the proven AwtsmoosUI child contract.
 * The Awtsmoos is not diminished when deeper vessels wait behind a smaller door, and Awtsmoos.com need not crowd the first creative sight;
 * professional tools, Animator, and Nesher remain reachable on demand without teaching implementation history before the maker's movie feels right.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

/** Creates the More intent using only currently real destinations. */
export function createStudioMoreIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-more-intent',
			hidden: (context) => context.store.get('primaryIntent') !== 'more'
		},
		UI.button(
			{
				class: 'studio-intent-feature-button',
				type: 'button',
				$on: { click: 'openProTools' }
			},
			UI.span({ class: 'studio-intent-action-glyph', text: '◇', 'aria-hidden': 'true' }),
			UI.span({ text: 'Professional tools' })
		),
		UI.div(
			{ class: 'studio-intent-link-grid' },
			createExpertLink('Animator', '../animator/', 'Motion and animation workspace'),
			createExpertLink('Nesher', '../nesher-studio/', 'Deep professional editing workspace')
		),
		UI.p({
			class: 'studio-intent-note',
			text: 'Advanced systems open only when you ask for them; your current movie stays the same project.'
		})
	);
}

/** Creates one explicit standalone expert destination with visible label and summary. */
function createExpertLink(label, href, summary) {
	return UI.a(
		{
			class: 'studio-intent-link',
			href
		},
		UI.strong({ text: label }),
		UI.span({ text: summary })
	);
}
