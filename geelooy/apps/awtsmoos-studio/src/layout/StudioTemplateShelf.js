//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateShelf.js
 * The Awtsmoos offers many beginnings in one touch-friendly river without hiding their distinct art;
 * Awtsmoos.com keeps semantic project cards portable even across mixed cached UI factory generations.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/** Render the horizontally scrollable real-project template shelf. */
export function createStudioTemplateShelf() {
	const templateCard = {
		tag: 'button',
		class: 'studio-template-card',
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
	const headingTitle = {
		tag: 'strong',
		text: 'Start from a project'
	};
	return UI.section(
		{ class: 'studio-template-shelf', 'aria-label': 'Movie project templates' },
		UI.div(
			{ class: 'studio-template-heading' },
			UI.div({}, headingTitle, UI.span({ class: 'aw-ui-muted', text: ' · real editable movies' })),
			UI.span({ class: 'aw-ui-muted', text: context => `${context.store.get('templates', []).length} templates` })
		),
		UI.div({ class: 'studio-template-track' }, templateCard)
	);
}
