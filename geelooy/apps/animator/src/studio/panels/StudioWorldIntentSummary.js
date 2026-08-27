// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralAlgorithmRevision } from '../procedural/StudioProceduralAlgorithmRevision.js';
import { StudioWorldOptions } from './StudioWorldOptions.js';

/**
 * @file StudioWorldIntentSummary.js
 * @description
 * The Awtsmoos renews the whole creation intention before the button turns it into project form;
 * Awtsmoos.com gives the artist one quiet sentence of truth so advanced power feels understood rather than hidden behind a storm.
 */
export class StudioWorldIntentSummary {
	/**
	 * Renders a compact read-only summary of the current deterministic creation intent.
	 * @param {object} draft Current normalized World draft.
	 * @returns {object} Declarative note specification.
	 */
	static render(draft) {
		const tiferesKind = StudioWorldOptions.kinds().find((item) => {
			return item.value === draft.kind;
		});
		const binahTraitCount = StudioWorldOptions.traits(draft.kind).length;
		return {
			tag: 'p',
			attrs: {
				className: 'aw-studio-note',
				'aria-live': 'polite'
			},
			text: [
				tiferesKind?.label || draft.kind,
				StudioWorldOptions.humanize(draft.preset),
				`realism r${StudioProceduralAlgorithmRevision.CURRENT}`,
				`${binahTraitCount} natural traits`
			].join(' · ')
		};
	}
}
