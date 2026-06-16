// B"H
/**
 * @file tanach_reader.mjs
 * @chapter The Scroll Is Read Once And Never Wounded
 * @description Loads Tanach.json and emits compact verse records from the real
 * shape observed on disk: 929 chapters, each with data.body.verses[].hebrew.text.
 */

import fs from "node:fs";
import { TANACH_JSON_PATH, DEFAULT_HEICHEL_ID } from "./config.mjs";
import { slugForBook } from "./book_names.mjs";
import { stripHtml, normalizeHebrew } from "./normalize_hebrew.mjs";

export function readTanach(pathname = TANACH_JSON_PATH) {
  return JSON.parse(fs.readFileSync(pathname, "utf8"));
}

function previewText(raw = "") {
  return stripHtml(raw).replace(/\s+/g, " ").trim().slice(0, 180);
}

function numericVerseNumber(verse, verseIndex) {
  const n = Number(verse?.hebrew?.number);
  return Number.isFinite(n) && n > 0 ? n : verseIndex + 1;
}

export function* iterateVerses(tanach) {
  const chapterByBook = new Map();
  for (let articleIndex = 0; articleIndex < tanach.length; articleIndex++) {
    const chapter = tanach[articleIndex];
    const titles = chapter?.data?.titles || [];
    const bookTitle = titles[2] || "unknown";
    const book = slugForBook(bookTitle);
    const chapterNumber = (chapterByBook.get(book) || 0) + 1;
    chapterByBook.set(book, chapterNumber);
    const verses = chapter?.data?.body?.verses || [];
    for (let verseIndex = 0; verseIndex < verses.length; verseIndex++) {
      const verse = verses[verseIndex];
      const rawHebrew = verse?.hebrew?.text || "";
      yield {
        book,
        bookTitle,
        chapter: chapterNumber,
        verse: numericVerseNumber(verse, verseIndex),
        articleIndex,
        verseIndex,
        heichelId: DEFAULT_HEICHEL_ID,
        seriesId: book,
        postId: String(chapter?.data?.body?.["article-id"] || `${book}-${chapterNumber}`),
        verseSection: 0,
        hebrewPreview: previewText(rawHebrew),
        rawHebrew: stripHtml(rawHebrew),
        normalizedHebrew: normalizeHebrew(rawHebrew)
      };
    }
  }
}

export function inspectTanach(tanach) {
  const verses = [...iterateVerses(tanach)];
  return {
    chapters: tanach.length,
    verses: verses.length,
    first: verses[0],
    last: verses[verses.length - 1],
    sampleTokens: verses[0]?.normalizedHebrew?.split(" ").slice(0, 12) || []
  };
}
