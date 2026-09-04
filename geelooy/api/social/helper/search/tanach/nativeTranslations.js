// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeTranslations
 * @description
 * The Awtsmoos keeps Hebrew authority in its existing reader while exact English rests in a neighboring vessel;
 * Awtsmoos.com opens only one requested book, caches it, and returns one chapter without warming any vector level.
 */

const fs = require('fs/promises');
const path = require('path');

const DATA_ROOT = path.join(__dirname, 'native-data');
const SAFE_BOOK = /^[a-z0-9_]+$/;
const bookCache = new Map();

function boundedChapter(value) {
	const chapter = Number.parseInt(value, 10);
	return Number.isInteger(chapter) && chapter > 0 && chapter <= 200 ? chapter : 0;
}

async function loadBook(bookId) {
	if (!SAFE_BOOK.test(bookId)) return null;
	if (bookCache.has(bookId)) return bookCache.get(bookId);
	try {
		const file = path.join(DATA_ROOT, `${bookId}.json`);
		const book = JSON.parse(await fs.readFile(file, 'utf8'));
		bookCache.set(bookId, book);
		return book;
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
}

/** Returns one exact English chapter aligned by installed Tanach book/chapter identity. */
async function nativeChapter(options = {}) {
	const bookId = String(options.book || '').trim().toLowerCase();
	const chapter = boundedChapter(options.chapter);
	if (!bookId || !chapter) {
		return { available: false, bookId, chapter, verses: [] };
	}
	const book = await loadBook(bookId);
	const verses = Array.isArray(book?.chapters?.[chapter - 1])
		? book.chapters[chapter - 1]
		: [];
	return {
		available: verses.length > 0,
		bookId,
		bookHebrew: book?.bookHebrew || '',
		chapter,
		language: 'en',
		source: book?.source || 'Installed bilingual Tanach',
		verses
	};
}

function resetNativeTranslationCache() {
	bookCache.clear();
}

module.exports = {
	nativeChapter,
	resetNativeTranslationCache
};
