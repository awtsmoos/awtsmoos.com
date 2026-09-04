// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins many lexical oceans through tiny byte pointers while every source file remains at rest;
 * Awtsmoos.com loads only the sorted key map on demand and seeks directly to the requested definition vessel best.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { outputRoot } from './config.mjs';

async function sourceFiles(root) {
	return (await fsp.readdir(root))
		.filter(name => name.endsWith('.source.json'))
		.sort();
}

async function indexSource(root, sourceFile, entries) {
	const source = JSON.parse(await fsp.readFile(path.join(root, sourceFile), 'utf8'));
	const file = `${source.id}.jsonl`;
	const filePath = path.join(root, file);
	const stream = fs.createReadStream(filePath, 'utf8');
	const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
	let offset = 0;
	let count = 0;
	for await (const line of lines) {
		const length = Buffer.byteLength(line + '\n');
		if (line.trim()) {
			const row = JSON.parse(line);
			const key = String(row.normalized || '');
			if (key) {
				(entries[key] ||= []).push({ sourceId: source.id, file, offset, length });
				count += 1;
			}
		}
		offset += length;
	}
	return [source.id, { ...source, entries: count }];
}

async function run(root) {
	const entries = {};
	const sources = {};
	for (const sourceFile of await sourceFiles(root)) {
		const [id, source] = await indexSource(root, sourceFile, entries);
		sources[id] = source;
	}
	const keys = Object.keys(entries).sort();
	await fsp.writeFile(path.join(root, 'index.json'), JSON.stringify({ keys, entries }));
	await fsp.writeFile(path.join(root, 'manifest.json'), JSON.stringify({
		generatedAt: new Date().toISOString(),
		sources
	}, null, '\t') + '\n');
	console.log(JSON.stringify({ keys: keys.length, sources: Object.keys(sources).length }));
}

await run(outputRoot(process.argv[2]));
