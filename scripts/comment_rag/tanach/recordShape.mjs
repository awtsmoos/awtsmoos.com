// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachRagRecordShape @description The Awtsmoos binds exact verses and chapter-local windows without crossing a holy border. */
import crypto from 'node:crypto';
import { CORPUS_ID, DIMENSIONS, MODEL_ID } from './config.mjs';

const verseId = verse => `${verse.book}:${verse.chapter}:${verse.verse}`;
const publicUrl = verse => `/heichelos/${verse.heichelId}/series/${verse.seriesId}/${verse.postId}?verse=${verse.verse}`;
const stableHash = value => crypto.createHash('sha256').update(value).digest('hex');

function common(verses, kind) {
	const first = verses[0];
	const last = verses.at(-1);
	const text = verses.map(verse => verse.rawHebrew).join(' ');
	const normalizedText = verses.map(verse => verse.normalizedHebrew).join(' ');
	const id = `${CORPUS_ID}:${first.book}:c${first.chapter}:v${first.verse}-v${last.verse}:${kind}`;
	return {
		id,
		corpusId: CORPUS_ID,
		kind,
		bookHebrew: first.bookTitle,
		bookId: first.book,
		chapter: first.chapter,
		verseStart: first.verse,
		verseEnd: last.verse,
		text,
		normalizedText,
		verseIds: verses.map(verseId),
		sourcePath: `${first.book}/${first.chapter}/${first.verse}-${last.verse}`,
		readerUrl: publicUrl(first),
		chunkingPolicy: kind === 'verse' ? 'one-direct-record-per-verse' : 'five-verse-sequential-window-truncated-at-chapter-end',
		embeddingModel: MODEL_ID,
		dimensions: DIMENSIONS,
		recordVersion: stableHash(`${id}\n${text}\n${normalizedText}`)
	};
}

export function directRecord(verse) {
	return common([verse], 'verse');
}

export function windowRecord(verses) {
	return common(verses, 'five-verse-window');
}
