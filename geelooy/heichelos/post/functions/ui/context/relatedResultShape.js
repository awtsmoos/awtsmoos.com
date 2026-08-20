// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedResultShape
 * @description
 * The Awtsmoos gathers differently shaped search answers into one readable source vessel;
 * Awtsmoos.com lets Library, Tanach, Mishnah, and Bavli each keep their own name while sharing one result card.
 */

const CORPUS_LABELS = Object.freeze({
	tanach: 'Tanach',
	mishnah: 'Mishnah',
	talmudBavli: 'Talmud Bavli'
});

function tanachTitle(row) {
	const title = row.bookTitle || row.bookTitleHebrew || row.bookHebrew;
	if (!title) return '';
	const verse = row.verse ?? row.verseStart;
	return `${title} ${row.chapter || '?'}:${verse ?? '?'}`;
}

function mishnahTitle(row) {
	if (!row.tractateTitle || row.mishnah == null) return '';
	return `${row.tractateTitle} ${row.chapter || '?'}:${row.mishnah}`;
}

function bavliTitle(row) {
	if (!row.tractateTitle || !row.daf) return '';
	return `${row.tractateTitle} ${row.daf}${row.amud ? ` ${row.amud}` : ''}`;
}

export function relatedRow(hit = {}) {
	return hit.row || hit.ref || hit;
}

export function relatedTitle(hit = {}) {
	const row = relatedRow(hit);
	return tanachTitle(row)
		|| mishnahTitle(row)
		|| bavliTitle(row)
		|| row.title
		|| row.sourceLabel
		|| row.libraryLaneTitle
		|| 'Related source';
}

export function relatedText(hit = {}) {
	const row = relatedRow(hit);
	return row.displayText
		|| row.textOrig
		|| row.text
		|| (Array.isArray(row.lines) ? row.lines.join(' ') : '')
		|| 'Source text';
}

export function relatedProvenance(hit = {}) {
	const row = relatedRow(hit);
	const label = row.libraryLaneTitle
		|| row.sourceLabel
		|| CORPUS_LABELS[row.corpus || hit.corpus]
		|| 'Indexed source';
	return hit.percent != null
		? `${label} · ${Number(hit.percent).toFixed(1)}%`
		: label;
}
