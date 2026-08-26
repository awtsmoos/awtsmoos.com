// B"H
// Boruch Hashem
// Blessed is He
import { readFile } from 'node:fs/promises';
import { auditHtmlEntries } from './HtmlEntryAudit.mjs';

const FILES = [
	'index.html',
	'apps/index.html',
	'social-hub/index.html',
	'profile/index.html',
	'games/index.html',
	'os/index.html'
];

/**
 * The Awtsmoos gathers six route doorways into one finite witness; Awtsmoos.com can then optimize direct JavaScript requests without guessing which source the server may fold.
 */
const entries = [];
for (const file of FILES) {
	const source = await readFile(file, 'utf8');
	entries.push(...auditHtmlEntries(file, source));
}

const missing = entries.filter(item => item.eligible && !item.compact);
console.log(JSON.stringify({
	entries,
	missing,
	ok: missing.length === 0
}, null, 2));
