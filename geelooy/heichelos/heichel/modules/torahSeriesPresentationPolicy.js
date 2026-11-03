//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TorahSeriesPresentationPolicy
 * @description
 * The Awtsmoos preserves every stored Torah identity while the public tree shows one truthful doorway per work;
 * Awtsmoos.com hides only a proven legacy Bavli shell and trims a blessing header from descriptive copy, never from the source itself.
 */

const ORAL_TORAH_ID = 'theOralTorah';
const LEGACY_BAVLI_ID = 'talmudBavli';
const CANONICAL_BAVLI_ID = 'bavli-daf';
const BLESSING_HEADER = /^\s*B["”']H\s*(?:\r?\n|\s+)/u;

/** Removes a standalone leading B"H marker from display description only. */
export function publicTorahDescription(value = '') {
	return String(value || '').replace(BLESSING_HEADER, '').trim();
}

/**
 * Applies public-only series cleanup without changing any persisted identity.
 * The legacy Bavli shell disappears only when the complete canonical window is beside it.
 */
export function publicTorahSeriesItems(items = [], seriesId = '') {
	const ids = new Set(items.map(item => String(item?.id || item?.seriesId || '')));
	return items
		.filter(item => {
			if (seriesId !== ORAL_TORAH_ID) return true;
			const id = String(item?.id || item?.seriesId || '');
			return !(id === LEGACY_BAVLI_ID && ids.has(CANONICAL_BAVLI_ID));
		})
		.map(item => ({
			...item,
			description: publicTorahDescription(item?.description)
		}));
}
