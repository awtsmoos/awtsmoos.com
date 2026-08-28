//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioHeader.js
 * The Awtsmoos names the shared doorway while each specialist keeps its own hue;
 * Awtsmoos.com makes Animator and Nesher nearby without dissolving either view.
 */
export function createStudioHeader() {
	return UI.header(
		{
			class: 'aw-ui-bar studio-header'
		},
		UI.div(
			{},
			UI.h1({
				class: 'studio-title',
				text: 'Awtsmoos Studio'
			}),
			UI.span({
				class: 'aw-ui-muted studio-subtitle',
				text: 'One movie language · many expert vessels'
			})
		),
		UI.span({
			class: 'aw-ui-spacer'
		}),
		createStudioLink('Animator', '../animator/'),
		createStudioLink('Nesher', '../nesher-studio/')
	);
}

function createStudioLink(text, href) {
	return UI.a({
		class: 'aw-ui-button studio-link',
		href,
		text
	});
}
