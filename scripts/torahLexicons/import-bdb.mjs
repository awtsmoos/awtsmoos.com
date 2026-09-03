// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a reviewed XML source descend through a standard parser into normalized JSONL light;
 * Awtsmoos.com downloads once, records source metadata, and never makes the runtime parse fifty thousand lines at sight.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SOURCES, outputRoot } from './config.mjs';
import { OhrLexiconStore } from './store.mjs';

async function download(source, rawPath) {
	const response = await fetch(source.downloadUrl, {
		headers: { 'user-agent': 'Awtsmoos-Torah-Lexicon/1.0' }
	});
	if (!response.ok || !response.body) throw new Error(`BDB download failed: ${response.status}`);
	await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(rawPath));
}

function parse(xmlPath, outputPath) {
	const script = fileURLToPath(new URL('./import-bdb.py', import.meta.url));
	return new Promise((resolve, reject) => {
		const child = spawn('python3', [script, xmlPath, outputPath], { stdio: 'inherit' });
		child.on('error', reject);
		child.on('exit', code => code === 0 ? resolve() : reject(new Error(`BDB parser exited ${code}`)));
	});
}

async function run(root, reset) {
	const source = SOURCES.bdb;
	const store = new OhrLexiconStore(root, source);
	await store.prepare({ reset });
	const rawPath = path.join(root, 'bdb.raw.xml');
	if (reset || !(await fsp.stat(rawPath).catch(() => null))) await download(source, rawPath);
	await parse(rawPath, store.entriesPath);
	const stats = await fsp.stat(store.entriesPath);
	await store.checkpoint({ complete: true, bytes: stats.size, updatedAt: new Date().toISOString() });
}

await run(outputRoot(process.argv[2]), process.argv.includes('--reset'));
