//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditIntent.js
 * @description Gives selected movie objects a small truthful editing doorway through rendered AwtsmoosUI children while preserving deeper inspector access.
 * The Awtsmoos lets one chosen vessel reveal the change that belongs to it, while Awtsmoos.com keeps selection clear in sight;
 * duplicate and delete travel the established editor command road, and deeper Edit opens only when the maker asks for greater light.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

/** Creates the beginner Edit intent around the current canonical selection. */
export function createStudioEditIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-edit-intent',
			hidden: (context) => context.store.get('primaryIntent') !== 'edit'
		},
		UI.p({
			class: 'studio-intent-guidance',
			text: selectionGuidance
		}),
		UI.div(
			{ class: 'studio-intent-action-grid' },
			createEditorButton('Duplicate', '⧉', 'duplicate'),
			createEditorButton('Delete', '⌫', 'delete', 'studio-intent-action-button is-danger')
		),
		UI.button({
			class: 'studio-intent-depth-button',
			type: 'button',
			'data-workspace-mode': 'edit',
			$on: { click: 'openPrimaryIntentWorkspace' },
			text: 'Open full Edit workspace'
		})
	);
}

/** Returns selection-aware guidance without inventing a second object state. */
function selectionGuidance(context) {
	const selectedLayerId = context.store.get('selectedLayerId');
	return selectedLayerId
		? `Editing ${selectedLayerId}. Changes stay on the canonical movie.`
		: 'Tap something on the canvas to edit it.';
}

/** Creates one established editor command action with visible glyph and label children. */
function createEditorButton(label, glyph, value, className = 'studio-intent-action-button') {
	return UI.button(
		{
			class: className,
			type: 'button',
			disabled: (context) => !context.store.get('selectedLayerId'),
			'data-command-type': 'editor',
			'data-command-value': value,
			$on: { click: 'executeStudioCommand' }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: glyph, 'aria-hidden': 'true' }),
		UI.span({ text: label })
	);
}
