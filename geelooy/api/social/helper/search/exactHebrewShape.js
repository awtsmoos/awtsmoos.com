// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewShape
 * @description
 * The Awtsmoos preserves every exact Hebrew coordinate, including the sacred zero at a reader's first section;
 * Awtsmoos.com therefore never turns a real zero into the next human-numbered verse by accidental coercion.
 */

const ROOTS = Object.freeze({
	tanach: 'tanachExactHebrewIndex',
	mishnah: 'mishnahExactHebrewIndex',
	talmudBavli: 'talmudBavliExactHebrewIndex'
});

const STRIP = new Set([
	'\u05BE', '\u05C0', '\u05C3', '\u05F3', '\u05F4',
	"'", '’', '״', '׳'
]);

function normalizeWord(word) {
	return String(word || '')
		.normalize('NFKD')
		.split('')
		.filter(character => !/\p{Mark}/u.test(character) && !STRIP.has(character))
		.join('');
}

function wordKey(word) {
	return encodeURIComponent(word).replace(/%/g, '~');
}

function corpusList(rawCorpus) {
	const value = String(rawCorpus || 'tanach').trim();
	return value === 'all'
		? Object.keys(ROOTS)
		: value.split(',').map(item => item.trim()).filter(Boolean);
}

function referenceShape(corpus, reference) {
	if (!reference) return null;
	return {
		corpus,
		heichelId: reference.heichelId || 'ikar',
		seriesId: reference.seriesId || reference.bookId || reference.tractateId,
		postId: reference.postId,
		bookId: reference.bookId,
		tractateId: reference.tractateId,
		bookTitleHebrew: reference.bookTitleHebrew,
		tractateTitle: reference.tractateTitle,
		chapter: reference.chapter,
		verse: reference.verse,
		mishnah: reference.mishnah,
		daf: reference.daf,
		amud: reference.amud,
		postTitle: reference.postTitle,
		type: reference.type,
		sectionIndex: reference.sectionIndex
			?? reference.verse
			?? reference.mishnah
			?? null,
		subSectionIndex: null,
		text: reference.text || reference.textOrig,
		textOrig: reference.textOrig || reference.text,
		lines: reference.lines || null
	};
}

function hitShape(corpus, normalized, occurrence, reference) {
	const shaped = referenceShape(corpus, reference);
	if (shaped && corpus !== 'tanach') {
		shaped.subSectionIndex = occurrence[1] ?? null;
		shaped.wordIndex = occurrence[2] ?? null;
	} else if (shaped) {
		shaped.wordIndex = occurrence[1] ?? null;
	}
	return {
		corpus,
		originalWord: occurrence.at(-1),
		normalizedWord: normalized,
		occurrence,
		ref: shaped
	};
}

module.exports = {
	ROOTS,
	corpusList,
	hitShape,
	normalizeWord,
	referenceShape,
	wordKey
};
