//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file publicationCatalogRollback.test.mjs
 * @description
 * The Awtsmoos proves native catalog activation keeps the last compatible
 * generation and removes only disposable zero-byte candidate WAL remnants.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { removeStaleCandidateWals } from '../../../../../../../scripts/comment_rag/publication_catalog/catalogCleanup.mjs';
import { publishCandidate } from '../../../../../../../scripts/comment_rag/publication_catalog/catalogPublisher.mjs';
import { generationFor, writeCandidate } from '../../../../../../../scripts/comment_rag/publication_catalog/catalogWriter.mjs';
import { inspectCatalog } from '../../../../../../../scripts/comment_rag/publication_catalog/verify.mjs';

/** Returns one complete English semantic publication descriptor for fixtures. */
function descriptor(count) {
	return {
		id: 'meluket',
		title: 'Meluket',
		aliases: ['meluket'],
		rootKind: 'live',
		databaseName: 'meluket.awtsdb',
		textName: null,
		matrixName: null,
		listName: 'vectors',
		count,
		dimensions: 384,
		embeddingModel: 'fixture',
		indexType: 'hnsw',
		partNumber: 1,
		expectedParts: 1,
		partial: false,
		textOnly: false,
		vectorEnabled: true,
		contentLanguage: 'en',
		semanticEligible: true
	};
}

/** Writes and activates one fixture generation through the real publisher. */
async function activate(live, rollback, count, suffix) {
	const items = [descriptor(count)];
	const generation = generationFor(items);
	const candidate = `${live}.candidate-${suffix}`;
	await writeCandidate(candidate, items, generation);
	await publishCandidate(candidate, live, rollback, 1, generation);
	return generation;
}

test('retains prior generation and cleans only disposable stale WALs', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awts-rag-rollback-'));
	const live = path.join(root, 'publication-catalog.awtsdb');
	const rollback = `${live}.previous`;
	try {
		const first = await activate(live, rollback, 10, '1');
		const second = await activate(live, rollback, 11, '2');
		const current = await inspectCatalog(live);
		const previous = await inspectCatalog(rollback);
		assert.equal(current.generation, second);
		assert.equal(previous.generation, first);
		assert.notEqual(current.generation, previous.generation);

		const stale = `${live}.candidate-999.wal`;
		const evidence = `${live}.candidate-1000.wal`;
		await fs.writeFile(stale, '');
		await fs.writeFile(evidence, 'B"H preserve evidence');
		assert.equal(await removeStaleCandidateWals(live), 1);
		await assert.rejects(fs.access(stale));
		await fs.access(evidence);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
