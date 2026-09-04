//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPrimaryDock.js
 * @description Projects the five beginner intentions through one truthful transient state using the proven AwtsmoosUI variadic-child contract.
 * The Awtsmoos lets five small doors face the maker while one movie remains the house they share;
 * Awtsmoos.com keeps Create, Edit, Animate, Audio, and More visible to the eye, while deeper workspaces wait where their real depth is fair.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_PRIMARY_INTENTS } from '../intents/StudioPrimaryIntentCatalog.js';

/** Creates the mobile-first dock from the shared primary-intent catalog. */
export function createStudioPrimaryDock() {
	return UI.nav(
		{
			class: 'studio-primary-dock',
			'aria-label': 'Primary creative tools'
		},
		...STUDIO_PRIMARY_INTENTS.map(createIntentButton)
	);
}

/** Creates one thumb-sized intent button whose glyph and label are real rendered children. */
function createIntentButton(ohrIntent) {
	return UI.button(
		{
			class: 'studio-primary-dock-button',
			type: 'button',
			'data-primary-intent': ohrIntent.id,
			'aria-label': `${ohrIntent.label}: ${ohrIntent.title}`,
			'aria-pressed': (context) => {
				return String(context.store.get('primaryIntent') === ohrIntent.id);
			},
			$on: { click: 'selectPrimaryIntent' }
		},
		UI.span({
			class: 'studio-primary-dock-glyph',
			text: ohrIntent.glyph,
			'aria-hidden': 'true'
		}),
		UI.span({
			class: 'studio-primary-dock-label',
			text: ohrIntent.label
		})
	);
}
