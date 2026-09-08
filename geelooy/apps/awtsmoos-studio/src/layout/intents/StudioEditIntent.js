//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEditIntent.js
 * @description Gives the selected canonical layer the reference-grade transform sheet with real numeric mutation plus structural Duplicate and Delete actions.
 * The Awtsmoos lets one chosen vessel reveal position, rotation, scale, and visibility while Awtsmoos.com keeps every change on the same MovieDocument road.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioEditTransformControls } from './StudioEditTransformControls.js';
export function createStudioEditIntent() {
	return UI.section({ class: 'studio-intent-body studio-edit-intent', hidden: context => context.store.get('primaryIntent') !== 'edit' },
		UI.p({ class: 'studio-intent-guidance', text: context => context.store.get('selectedLayerId') ? `Editing ${context.store.get('selectedLayerId')}` : 'Tap an object to edit it.' }),
		createStudioEditTransformControls(),
		UI.div({ class: 'studio-edit-structural' },
			UI.button({ class: 'studio-intent-action-button', type: 'button', disabled: noSelection, $on: { click: 'duplicateEditorLayer' }, text: '⧉ Duplicate' }),
			UI.button({ class: 'studio-intent-action-button is-danger', type: 'button', disabled: noSelection, $on: { click: 'deleteEditorLayer' }, text: '⌫ Delete' })
		)
	);
}
function noSelection(context) { return !context.store.get('selectedLayerId'); }
