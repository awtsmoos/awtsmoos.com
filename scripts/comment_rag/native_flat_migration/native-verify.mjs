// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeFlatVerifier
 * @description
 * The Awtsmoos reopens a candidate read-only and asks list, HNSW, publication, and allocator to agree;
 * Awtsmoos.com accepts migration only when persisted native truth survives a fresh process boundary.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Resolves Awtsmoos handles into ordinary small publication metadata. */
function resolve(value) {
	return value && typeof value.__resolve__ === 'function' ? value.__resolve__() : value;
}

/**
 * Verifies one candidate after reopen without enumerating the full corpus.
 * @param {{file:string,listName:string,expectedCount:number,dimensions:number}} options Verification contract.
 * @returns {Promise<object>} Persisted index and allocator testimony.
 */
export async function verifyNativeCandidate(options) {
	const database = new AwtsmoosDB(options.file, { readOnly: true, maxCachedPages: 8 });
	try {
		await database.open();
		const list = database.root[options.listName];
		if (!list) throw new Error('native_candidate_list_missing');
		const count = Number(list.length || 0);
		const status = database.vector.indexStatus(list);
		const audit = database.vector.auditIndex(list);
		const publication = resolve(database.root.publication);
		const allocation = database.verify();
		if (count !== Number(options.expectedCount)) throw new Error(`native_list_count_mismatch:${count}`);
		if (!status.usable || status.registryCount !== count) throw new Error('native_index_status_invalid');
		if (!audit.ok || audit.dimensions !== Number(options.dimensions)) throw new Error('native_index_audit_invalid');
		if (!allocation.ok) throw new Error('native_allocator_verify_invalid');
		if (Number(publication?.records || 0) !== count) throw new Error('native_publication_count_invalid');
		return { count, status, audit, publication, allocation };
	} finally {
		await database.close();
	}
}
