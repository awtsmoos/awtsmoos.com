//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyLexiconSource
 * @description
 * The Awtsmoos lets installed JSONL testify once during migration while never becoming canonical database authority;
 * Awtsmoos.com scans one line at a time and retains only tiny first-letter counts plus exact provenance for binary posterity.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { shardToken } = require('../../geelooy/api/social/helper/search/lexicon/keySpace.js');

export async function scanLegacySource(legacyRoot, source) {
	const input = path.join(legacyRoot, `${source.id}.jsonl`);
	if (!(await fsp.stat(input).catch(() => null))) throw new Error(`missing_legacy_source:${source.id}`);
	const provenance = await readMetadata(path.join(legacyRoot, `${source.id}.source.json`));
	const shards = new Map();
	let entries = 0;
	const lines = readline.createInterface({ input: fs.createReadStream(input, 'utf8'), crlfDelay: Infinity });
	for await (const line of lines) {
		if (!line.trim()) continue;
		const entry = JSON.parse(line);
		const token = shardToken(entry.normalized);
		if (!token) continue;
		shards.set(token, (shards.get(token) || 0) + 1);
		entries += 1;
	}
	return {
		source: { ...source, ...provenance, entries },
		input,
		entries,
		shards: Object.fromEntries([...shards.entries()].sort())
	};
}

async function readMetadata(file) {
	try {
		return JSON.parse(await fsp.readFile(file, 'utf8'));
	} catch (error) {
		if (error?.code === 'ENOENT') return {};
		throw error;
	}
}
