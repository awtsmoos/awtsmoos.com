// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module YiddishKaikkiImport
 * @description
 * The Awtsmoos lets Yiddish words arrive from structured Wiktionary vessels with English glosses named;
 * Awtsmoos.com streams the corpus, rewrites normalized output deterministically, and keeps attribution unmaimed.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { SOURCES, outputRoot } from './config.mjs';
import { normalizeLexiconKey } from './normalize.mjs';
import { OhrLexiconStore } from './store.mjs';

function shape(row) {
	const senses = (row.senses || [])
		.flatMap(sense => (sense.glosses || [])
			.map(definition => ({ definition: String(definition) })));
	return {
		headword: String(row.word || ''),
		normalized: normalizeLexiconKey(row.word),
		language: 'Yiddish',
		partOfSpeech: String(row.pos || ''),
		senses,
		forms: (row.forms || [])
			.map(form => String(form.form || ''))
			.filter(Boolean),
		providerEntryId: String(row.id || '')
	};
}

async function download(source, rawPath) {
	const response = await fetch(source.downloadUrl, {
		headers: { 'user-agent': 'Awtsmoos-Torah-Lexicon/1.0' }
	});
	if (!response.ok || !response.body) {
		throw new Error(`Yiddish download failed: ${response.status}`);
	}
	await pipeline(
		Readable.fromWeb(response.body),
		fs.createWriteStream(rawPath)
	);
}

async function run(root, reset) {
	const source = SOURCES.yiddish;
	const store = new OhrLexiconStore(root, source);
	await store.prepare({ reset });
	const rawPath = path.join(root, 'yiddish.raw.jsonl');
	const rawExists = await fsp.stat(rawPath).catch(() => null);
	if (reset || !rawExists) await download(source, rawPath);
	await fsp.writeFile(store.entriesPath, '');
	const lines = readline.createInterface({
		input: fs.createReadStream(rawPath, 'utf8'),
		crlfDelay: Infinity
	});
	let count = 0;
	for await (const line of lines) {
		if (!line.trim()) continue;
		const entry = shape(JSON.parse(line));
		if (!entry.normalized || !entry.senses.length) continue;
		await store.append(entry);
		count += 1;
	}
	await store.checkpoint({
		count,
		complete: true,
		updatedAt: new Date().toISOString()
	});
	console.log(JSON.stringify({ sourceId: source.id, count, complete: true }));
}

await run(outputRoot(process.argv[2]), process.argv.includes('--reset'));
