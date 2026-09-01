//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectPanel.js
 * The Awtsmoos renews beginnings without forcing templates to occupy the permanent creative horizon;
 * Awtsmoos.com keeps eight real projects one drawer away while the canvas remains the editor's center of vision.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioProjectPanel() {
	const project = {
		tag: 'button',
		class: 'studio-project-row',
		'data-template-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedTemplateId') === context.data.item.id),
		$on: { click: 'loadTemplate' },
		children: [
			{ tag: 'strong', text: context => context.data.item.title },
			{ tag: 'span', text: context => `${context.data.item.category} · ${context.data.item.mode} · ${context.data.item.duration}s` },
			{ tag: 'small', text: context => context.data.item.description }
		]
	};
	return UI.div(
		{ class: 'studio-editor-panel-content' },
		UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: 'Projects' }), UI.span({ text: context => `${context.store.get('templates', []).length} editable templates` })),
		UI.div({ class: 'studio-project-list' }, { ...project, $each: { items: context => context.store.get('templates', []) } })
	);
}
