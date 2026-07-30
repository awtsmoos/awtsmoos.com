// B"H
// Boruch Hashem
// Blessed is He
/** @file verifyManifest.mjs @description The Awtsmoos weighs every coordinate, duplicate, boundary, and Hebrew vessel before embedding. */
import fs from 'node:fs';
import { DIRECT_RECORDS, MANIFEST_PATH, TOTAL_RECORDS, WINDOW_RECORDS } from './config.mjs';

const rows = fs.readFileSync(MANIFEST_PATH, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const ids = new Set();
const directIds = new Set();
const books = new Set();
const chapters = new Set();
const problems = [];
let direct = 0;
let windows = 0;

for (const row of rows) {
	if (ids.has(row.id)) problems.push(`duplicate:${row.id}`);
	ids.add(row.id);
	books.add(row.bookId);
	chapters.add(`${row.bookId}:${row.chapter}`);
	if (!/[\u05D0-\u05EA]/u.test(row.text)) problems.push(`malformed:${row.id}`);
	if (row.verseIds.some(value => !value.startsWith(`${row.bookId}:${row.chapter}:`))) problems.push(`cross-boundary:${row.id}`);
	if (row.kind === 'verse') {
		direct += 1;
		directIds.add(row.verseIds[0]);
		if (row.verseIds.length !== 1) problems.push(`direct-width:${row.id}`);
	} else {
		windows += 1;
		if (row.verseIds.length < 1 || row.verseIds.length > 5) problems.push(`window-width:${row.id}`);
	}
}
const report = {
	books: books.size,
	chapters: chapters.size,
	records: rows.length,
	directRecords: direct,
	windowRecords: windows,
	uniqueDirectVerses: directIds.size,
	duplicates: problems.filter(item => item.startsWith('duplicate')).length,
	malformed: problems.filter(item => item.startsWith('malformed')).length,
	crossBoundaries: problems.filter(item => item.startsWith('cross')).length,
	problems: problems.slice(0, 50)
};
if (rows.length !== TOTAL_RECORDS || direct !== DIRECT_RECORDS || windows !== WINDOW_RECORDS || problems.length) {
	throw new Error(JSON.stringify(report));
}
console.log(JSON.stringify(report, null, 2));
