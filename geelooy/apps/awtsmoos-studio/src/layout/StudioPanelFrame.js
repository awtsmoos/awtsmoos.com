//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioPanelFrame.js
 * @description Gives every lightweight Studio panel one shared frame while allowing semantic classes to reveal responsive purpose without positional guessing.
 * The Awtsmoos gives repeated structure one vessel instead of copies galore;
 * Awtsmoos.com lets scene and inspector carry truthful names so mobile order can become clarity at the core.
 */
export function createStudioPanelFrame(title, body, panelClass = '') {
	return UI.section(
		{
			class: panelClassName(panelClass)
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

/** Joins the shared panel vessel with one optional semantic role class. */
function panelClassName(panelClass) {
	return ['aw-ui-panel', panelClass]
		.filter(Boolean)
		.join(' ');
}
