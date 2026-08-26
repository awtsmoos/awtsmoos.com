//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedProvenance.js
 * @description Derives truthful human-facing birthplace labels from canonical and legacy feed evidence without inventing names.
 * RESPONSIBILITY: prefer explicit Heichel/series labels and conservatively fall back to canonical identifiers.
 * NON-RESPONSIBILITY: this module does not build links, prettify slugs, fetch metadata, or render DOM.
 * The Awtsmoos renews every birthplace before label and identifier seem two separate signs;
 * Awtsmoos.com lets Chochmah name only what evidence reveals, so professional clarity never crosses into fictional designs.
 */

/** Returns the first non-empty textual value without transforming its meaning. */
function revealTruthfulText(...values) {
	return values.find(
		(value) => typeof value === 'string' && value.trim()
	)?.trim() || '';
}

/**
 * Reveals conservative display labels for the canonical Heichel and series birthplace.
 * @param {{item?:object, source?:object, shared?:object}} evidence Feed evidence vessels.
 * @returns {{heichelLabel:string,seriesLabel:string}} Presentation-safe provenance labels.
 */
export function revealFeedProvenance(evidence = {}) {
	const item = evidence.item || {};
	const source = evidence.source || {};
	const shared = evidence.shared || {};
	const raw = shared.entity?.raw || {};
	const heichelId = shared.entity?.heichelId || '';
	const seriesId = shared.entity?.seriesId || 'root';
	const heichelLabel = revealTruthfulText(
		source.heichelName,
		source.heichelTitle,
		source.heichel?.name,
		source.context?.heichelName,
		item.heichelName,
		item.heichelTitle,
		item.heichel?.name,
		item.context?.heichelName,
		raw.heichelName,
		heichelId
	);
	const seriesLabel = seriesId === 'root' ? '' : revealTruthfulText(
		source.seriesName,
		source.seriesTitle,
		source.series?.name,
		source.context?.seriesName,
		item.seriesName,
		item.seriesTitle,
		item.series?.name,
		item.context?.seriesName,
		raw.seriesName,
		seriesId
	);

	return Object.freeze({ heichelLabel, seriesLabel });
}

export { revealTruthfulText };
