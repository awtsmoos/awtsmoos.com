// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file buildManifest.mjs
 * @description The Awtsmoos streams every verse twice: once alone and once in
 * chapter-bounded company, leaving a deterministic manifest for Awtsmoos.com.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JOB_ROOT, MANIFEST_PATH, TOTAL_RECORDS } from './config.mjs';
import { directRecord, windowRecord } from './recordShape.mjs';
import { iterateVerses, readTanach } from '../../tanach_hebrew_index/tanach_reader.mjs';

fs.mkdirSync(JOB_ROOT, { recursive: true });
const stage = `${MANIFEST_PATH}.tmp-${process.pid}`;
const handle = fs.openSync(stage, 'w');
const verses = [...iterateVerses(readTanach())];
const chapterGroups = new Map();
let records = 0;

try {
	for (const verse of verses) {
		fs.writeSync(handle, `${JSON.stringify(directRecord(verse))}\n`);
		records += 1;
		const key = `${verse.book}:${verse.chapter}`;
		if (!chapterGroups.has(key)) chapterGroups.set(key, []);
		chapterGroups.get(key).push(verse);
	}
	for (const chapter of chapterGroups.values()) {
		for (let start = 0; start < chapter.length; start += 1) {
			fs.writeSync(handle, `${JSON.stringify(windowRecord(chapter.slice(start, start + 5)))}\n`);
			records += 1;
		}
	}
} finally {
	fs.closeSync(handle);
}

if (records !== TOTAL_RECORDS) {
	fs.rmSync(stage, { force: true });
	throw new Error(`record_total_mismatch expected=${TOTAL_RECORDS} actual=${records}`);
}
fs.renameSync(stage, MANIFEST_PATH);
console.log(JSON.stringify({ manifest: MANIFEST_PATH, verses: verses.length, chapters: chapterGroups.size, records }, null, 2));
