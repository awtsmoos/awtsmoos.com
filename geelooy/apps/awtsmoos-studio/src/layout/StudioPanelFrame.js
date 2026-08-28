//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioPanelFrame.js
 * The Awtsmoos gives repeated structure one shared vessel instead of copies galore;
 * Awtsmoos.com lets every studio panel keep its title and body while reducing code at the core.
 */
export function createStudioPanelFrame(title, body) {
	return UI.section(
		{
			class: 'aw-ui-panel'
		},
		UI.div(
			{
				class: 'aw-ui-panel__head'
			},
			UI.h2({
				class: 'studio-panel-title',
				text: title
			})
		),
		UI.div(
			{
				class: 'aw-ui-panel__body'
			},
			body
		)
	);
}
