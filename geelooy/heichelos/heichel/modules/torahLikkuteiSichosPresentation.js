// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLikkuteiSichosPresentation
 * @description Adds each Likkutei Sichos volume's covered Chumash to its English title.
 */

const LIKKUTEI_SICHOS_BOOKS = Object.freeze([
	'Bereishis',
	'Shemos',
	'Vayikra',
	'Bamidbar',
	'Devarim'
]);

function likkuteiSichosSubtitle(volume) {
	if (volume === 1 || volume === 3) return 'Bereishis–Vayikra';
	if (volume === 2 || volume === 4) return 'Bamidbar–Devarim';
	if (volume >= 5) return LIKKUTEI_SICHOS_BOOKS[(volume - 5) % 5];
	return null;
}

/** Appends covered books only when the title does not already carry a subtitle. */
export function withLikkuteiSichosBooks(key, raw, english) {
	if (!english || english.includes('(')) return english;
	const match = String(key || '').match(/^likkuteiSichosVolume(\d+)$/i)
		|| String(raw || '').match(/Likkutei Sichos,?\s+Volume\s+(\d+)/i)
		|| String(raw || '').match(/Likkutei Sichos,?\s+Vol\.?\s+(\d+)/i);
	if (!match) return english;
	const subtitle = likkuteiSichosSubtitle(Number(match[1]));
	return subtitle ? `${english} (${subtitle})` : english;
}
