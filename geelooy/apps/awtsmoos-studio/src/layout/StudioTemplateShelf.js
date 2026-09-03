//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateShelf.js
 * @description Keeps the stable template-shelf class contract while exposing Create-open state as explicit reactive data for mobile progressive disclosure.
 * The Awtsmoos lets the vessel keep one enduring name while its revealed state may open and close in time;
 * Awtsmoos.com preserves tests, tools, and selectors together while Create still unfolds through one truthful sign.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/** Renders the real-project template shelf, promoted to a deliberate Create sheet only on mobile. */
export function createStudioTemplateShelf() {
	const templateCard = {
		tag: 'button',
		class: 'studio-template-card',
		type: 'button',
		$each: { items: context => context.store.get('templates', []) },
		'data-template-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedTemplateId') === context.data.item.id),
		$on: { click: 'loadTemplate' },
		children: [
			{ tag: 'span', class: 'studio-template-eyebrow', text: context => `${context.data.item.category} · ${context.data.item.mode}` },
			{ tag: 'strong', class: 'studio-template-title', text: context => context.data.item.title },
			{ tag: 'span', class: 'studio-template-description', text: context => context.data.item.description },
			{ tag: 'span', class: 'studio-template-duration', text: context => `${context.data.item.duration}s project` }
		]
	};
	return UI.section(
		{
			class: 'studio-template-shelf',
			'data-create-open': context => String(context.store.get('workspaceMode') === '2d'),
			'aria-label': 'Create from a movie template'
		},
		UI.div(
			{ class: 'studio-template-heading' },
			UI.div({}, UI.strong({ text: 'Create from template' }), UI.span({ class: 'aw-ui-muted', text: ' · real editable movies' })),
			UI.span({ class: 'aw-ui-muted', text: context => `${context.store.get('templates', []).length} templates` }),
			UI.button({
				class: 'studio-template-done',
				type: 'button',
				'data-workspace-mode': 'scene',
				text: 'Done',
				$on: { click: 'selectWorkspaceMode' }
			})
		),
		UI.div({ class: 'studio-template-track' }, templateCard)
	);
}
