// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventory.mjs
 * @description The Awtsmoos separates discovery from paid speech; Awtsmoos.com accepts a plain JSONL ledger of genuinely missing source passages,
 * deduplicates their inner letters by hash, and refuses malformed or already-translated rows before any provider request appears.
 */

import fs from 'node:fs';
import readline from 'node:readline';
import { contentHash, normalizeSource } from './contentHash.mjs';

/**
 * @description Normalizes one inventory record into the provider-independent harvest contract.
 * @param {object} record Raw JSONL record.
 * @param {number} lineNumber Source line number.
 * @returns {object|null} Normalized record or null when an English translation already exists.
 */
export function normalizeRecord(record, lineNumber) {
	if (!record || typeof record !== 'object' || Array.isArray(record)) {
		throw new Error(`Inventory line ${lineNumber} must be an object`);
	}
	if (record.translation || record.english || record.targetText) {
		return null;
	}
	const source = normalizeSource(record.source ?? record.text ?? record.hebrew);
	if (!source) {
		throw new Error(`Inventory line ${lineNumber} has no source text`);
	}
	const hash = contentHash(source);
	return {
		id: String(record.id || record.key || hash.slice(0, 16)),
		hash,
		source,
		corpus: String(record.corpus || 'unknown'),
		metadata: record.metadata && typeof record.metadata === 'object' ? record.metadata : {}
	};
}

/**
 * @description Streams and deduplicates a missing-translation JSONL inventory.
 * @param {string} filePath JSONL inventory path.
 * @returns {Promise<object[]>} Unique normalized missing records.
 */
export async function readInventory(filePath) {
	if (!filePath) {
		throw new Error('Use --inventory=/absolute/or/relative/missing.jsonl');
	}
	const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
	const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
	const records = [];
	const seenHashes = new Set();
	let lineNumber = 0;
	for await (const line of lines) {
		lineNumber += 1;
		if (!line.trim()) {
			continue;
		}
		const normalized = normalizeRecord(JSON.parse(line), lineNumber);
		if (!normalized || seenHashes.has(normalized.hash)) {
			continue;
		}
		seenHashes.add(normalized.hash);
		records.push(normalized);
	}
	return records;
}
