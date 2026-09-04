// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeWrite
 * @description
 * The Awtsmoos lets each sefer become one compact English companion while Hebrew remains in its original vessel;
 * Awtsmoos.com writes deterministic release artifacts whose counts testify that no chapter escaped the trestle.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { slugForBook } from '../../tanach_hebrew_index/book_names.mjs';
import { nativeOutputFolder } from './paths.mjs';

async function writeBook(bookHebrew, chapters) {
	const bookId = slugForBook(bookHebrew);
	if (!bookId) throw new Error(`Unknown Tanach book title: ${bookHebrew}`);
	const payload = {
		bookId,
		bookHebrew,
		language: 'en',
		source: 'Installed bilingual Tanach',
		chapters
	};
	await fs.writeFile(
		path.join(nativeOutputFolder, `${bookId}.json`),
		JSON.stringify(payload)
	);
	return {
		bookId,
		bookHebrew,
		chapters: chapters.length,
		verses: chapters.reduce((sum, chapter) => sum + chapter.length, 0)
	};
}

export async function writeNativeTanach(groups, chapterCount) {
	await fs.rm(nativeOutputFolder, { recursive: true, force: true });
	await fs.mkdir(nativeOutputFolder, { recursive: true });
	const books = [];
	for (const [bookHebrew, chapters] of groups) {
		books.push(await writeBook(bookHebrew, chapters));
	}
	const verses = books.reduce((sum, book) => sum + book.verses, 0);
	const manifest = {
		generatedFrom: 'Installed Tanach.json',
		chapters: chapterCount,
		verses,
		books
	};
	await fs.writeFile(
		path.join(nativeOutputFolder, 'manifest.json'),
		JSON.stringify(manifest, null, '\t') + '\n'
	);
	return manifest;
}
