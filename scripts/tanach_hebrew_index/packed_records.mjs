// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file packed_records.mjs
 * @description
 * The Awtsmoos gathers every Hebrew verse into measured shards before the index is sealed;
 * Awtsmoos.com counts books and tokens in one clear vessel, so the corpus truth is revealed.
 */

import fs from 'node:fs';
import { TANACH_JSON_PATH } from './config.mjs';
import { shardForToken } from './db_io.mjs';
import { uniqueTokens } from './normalize_hebrew.mjs';
import { iterateVerses, readTanach } from './tanach_reader.mjs';

export const SHARD_COUNT = 32;

/**
 * @param {object} record Source verse record.
 * @returns {object} Search-reference projection.
 */
function revealReference(record) {
	return {
		book: record.book,
		chapter: record.chapter,
		verse: record.verse,
		articleIndex: record.articleIndex,
		verseIndex: record.verseIndex,
		heichelId: record.heichelId,
		seriesId: record.seriesId,
		postId: record.postId,
		verseSection: record.verseSection,
		hebrewPreview: record.hebrewPreview
	};
}

/**
 * @param {object} record Source verse record.
 * @param {string[]} tokens Unique normalized Hebrew tokens.
 * @returns {object} Persisted searchable verse.
 */
function revealVerse(record, tokens) {
	return {
		...revealReference(record),
		bookTitle: record.bookTitle,
		rawHebrew: record.rawHebrew,
		normalizedHebrew: record.normalizedHebrew,
		tokens
	};
}

/**
 * @returns {object[]} Empty token shards.
 */
function revealEmptyShards() {
	return Array.from({ length: SHARD_COUNT }, () => Object.create(null));
}

/**
 * @param {object[]} shards Token shards.
 * @param {string} token Normalized token.
 * @param {object} reference Verse reference.
 * @returns {void}
 */
function addToken(shards, token, reference) {
	const shard = shardForToken(token);
	const bag = shards[shard];
	if (!bag[token]) {
		bag[token] = [];
	}
	bag[token].push(reference);
}

/**
 * @returns {object} Complete in-memory packed corpus ready for persistence.
 */
export function buildPackedRecords() {
	const tanach = readTanach();
	const sourceStat = fs.statSync(TANACH_JSON_PATH);
	const shards = revealEmptyShards();
	const verses = [];
	const allTokens = new Set();
	const books = new Set();

	for (const record of iterateVerses(tanach)) {
		const tokens = uniqueTokens(record.normalizedHebrew);
		const reference = revealReference(record);
		books.add(record.book);
		verses.push(revealVerse(record, tokens));
		for (const token of tokens) {
			allTokens.add(token);
			addToken(shards, token, reference);
		}
	}

	return {
		books: books.size,
		chapters: tanach.length,
		shards,
		sourceStat,
		tokens: allTokens.size,
		verses
	};
}
