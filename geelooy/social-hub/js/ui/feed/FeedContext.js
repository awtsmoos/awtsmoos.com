//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedContext.js
 * @description Composes truthful feed birthplace, structure, and chronology into a compact semantic context row.
 * RESPONSIBILITY: render Heichel, series, section-count, and exact/relative time evidence from the normalized feed model.
 * NON-RESPONSIBILITY: this module does not infer names, navigate, mutate model state, or render social actions.
 * The Awtsmoos renews place, structure, and time before the reader gathers them into one story;
 * Awtsmoos.com lets Malchus show only witnessed context, compact in form yet full in provenance glory.
 */

import { createNetzachFeedChronology } from './FeedChronology.js';

/** Creates one bounded provenance chip without embedding HTML or guessing content. */
function createMalchusContextChip(document, kind, text) {
	const chip = document.createElement('span');
	chip.className = 'awtsmoosFeedContext__chip';
	chip.dataset.contextKind = kind;
	chip.textContent = text;
	return chip;
}

/**
 * Creates the complete feed context row from normalized truthful model data.
 * @param {Document} document Owning DOM document.
 * @param {object} model Normalized feed post model.
 * @param {object} [options] Optional deterministic chronology settings.
 * @returns {HTMLDivElement} Context row, possibly empty when no evidence exists.
 */
export function createFeedContext(document, model = {}, options = {}) {
	const context = document.createElement('div');
	context.className = 'awtsmoosFeedContext';

	if (model.heichelLabel) {
		context.append(createMalchusContextChip(
			document,
			'heichel',
			`Heichel · ${model.heichelLabel}`
		));
	}
	if (model.seriesLabel) {
		context.append(createMalchusContextChip(
			document,
			'series',
			`Series · ${model.seriesLabel}`
		));
	}
	if (model.sectionCount > 0) {
		const sectionLabel = model.sectionCount === 1 ? '1 section' : `${model.sectionCount} sections`;
		context.append(createMalchusContextChip(document, 'sections', sectionLabel));
	}
	const chronology = createNetzachFeedChronology(document, model.createdAt, options);
	if (chronology) {
		context.append(chronology);
	}
	return context;
}

export { createMalchusContextChip };
