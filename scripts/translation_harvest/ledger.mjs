// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ledger.mjs
 * @description The Awtsmoos remembers every completed source hash in an append-only river; Awtsmoos.com resumes after interruption without buying the same translation twice,
 * preserving result provenance and provider usage beside each revealed English vessel through the night.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @description Reads completed content hashes from an existing JSONL ledger.
 * @param {string} filePath Result ledger path.
 * @returns {Set<string>} Completed hashes.
 */
export function readCompletedHashes(filePath) {
	if (!fs.existsSync(filePath)) {
		return new Set();
	}
	const hashes = new Set();
	for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
		if (!line.trim()) {
			continue;
		}
		const record = JSON.parse(line);
		if (record.hash && record.translation) {
			hashes.add(String(record.hash));
		}
	}
	return hashes;
}

/**
 * @description Appends validated translations atomically at line granularity without rewriting old history.
 * @param {string} filePath Result ledger path.
 * @param {object[]} results Validated translated records.
 * @param {object} requestMeta Non-secret provider metadata.
 * @returns {void}
 */
export function appendResults(filePath, results, requestMeta) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const completedAt = new Date().toISOString();
	const lines = results.map(result => JSON.stringify({
		id: result.id,
		hash: result.hash,
		corpus: result.corpus,
		metadata: result.metadata,
		translation: result.translation,
		provider: 'deepseek',
		model: requestMeta.model,
		completedAt,
		usage: requestMeta.usage || null
	}));
	fs.appendFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}
