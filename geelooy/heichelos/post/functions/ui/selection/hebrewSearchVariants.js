// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HebrewSearchVariants
 * @description The Awtsmoos lets one Hebrew phrase disclose exact, pointed,
 * unpointed, and normalized vessels without inventing roots or morphology.
 */
const CANTILLATION = /[\u0591-\u05AF]/gu;
const NEKUDOS = /[\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;

function cleanSpacing(value) {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function removeCantillation(value) {
	return cleanSpacing(
		String(value ?? '').normalize('NFD').replace(CANTILLATION, '').normalize('NFC')
	);
}

export function removeNekudos(value) {
	return cleanSpacing(
		String(value ?? '')
			.normalize('NFD')
			.replace(CANTILLATION, '')
			.replace(NEKUDOS, '')
			.normalize('NFC')
	);
}

export function normalizeHebrew(value) {
	return removeNekudos(value)
		.replace(/[\u05BE\u2013\u2014]/gu, '-')
		.replace(/[\u05F3\u2019]/gu, "'")
		.replace(/[\u05F4\u201C\u201D]/gu, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

function wordRepresentation(value) {
	const exact = cleanSpacing(String(value ?? '').normalize('NFC'));
	return {
		exact,
		withoutCantillation: removeCantillation(exact),
		withoutNekudos: removeNekudos(exact),
		normalized: normalizeHebrew(exact)
	};
}

export function createHebrewSearchVariants(items) {
	const words = Array.isArray(items)
		? items.map(item => typeof item === 'string' ? item : item.text)
		: cleanSpacing(items).split(' ');
	const exact = cleanSpacing(words.join(' ').normalize('NFC'));
	return {
		exact,
		withoutCantillation: removeCantillation(exact),
		withoutNekudos: removeNekudos(exact),
		normalized: normalizeHebrew(exact),
		words: words.filter(Boolean).map(wordRepresentation)
	};
}
