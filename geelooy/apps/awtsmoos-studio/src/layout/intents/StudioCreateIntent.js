//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCreateIntent.js
 * @description Projects real canonical creation commands and project templates into a compact beginner-first Create surface through real AwtsmoosUI children.
 * The Awtsmoos brings many forms from one source, while Awtsmoos.com lets the maker call each vessel by a simple name;
 * every quick-add button crosses the existing command path, so touch and deeper command language kindle the same flame.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const QUICK_CREATE_ITEMS = Object.freeze([
	item('Text', 'T', 'text'),
	item('Shape', '□', 'shape2d'),
	item('Image', '▧', 'image'),
	item('Video', '▶', 'video'),
	item('Caption', 'CC', 'caption'),
	item('Camera', '◉', 'camera')
]);

/** Creates the phone Create intent with fast canonical additions and compact project starters. */
export function createStudioCreateIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-create-intent',
			hidden: (context) => context.store.get('primaryIntent') !== 'create'
		},
		UI.div(
			{ class: 'studio-intent-action-grid' },
			...QUICK_CREATE_ITEMS.map(createQuickButton)
		),
		UI.div({ class: 'studio-intent-subheading', text: 'Start from a template' }),
		UI.div(
			{
				class: 'studio-intent-template-track',
				$each: (context) => context.store.get('templates')
			},
			createTemplateButton()
		)
	);
}

/** Creates one canonical create-command button. */
function createQuickButton(ohrItem) {
	return UI.button(
		{
			class: 'studio-intent-action-button',
			type: 'button',
			'data-command-type': 'create',
			'data-command-value': ohrItem.kind,
			$on: { click: 'executeStudioCommand' }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: ohrItem.glyph, 'aria-hidden': 'true' }),
		UI.span({ text: ohrItem.label })
	);
}

/** Creates one compact template action using the established project loader. */
function createTemplateButton() {
	return UI.button(
		{
			class: 'studio-intent-template-button',
			type: 'button',
			'data-template-id': (context) => context.data.item.id,
			$on: { click: 'loadTemplate' }
		},
		UI.strong({ text: (context) => context.data.item.title }),
		UI.span({ text: (context) => context.data.item.category })
	);
}

/** Creates one immutable quick-add descriptor. */
function item(label, glyph, kind) {
	return Object.freeze({ label, glyph, kind });
}
