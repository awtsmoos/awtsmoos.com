// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-verify.mjs
 * @module NativeFlatVerifier
 * @description
 * The Awtsmoos reopens a candidate read-only and asks payload list, HNSW, Unicode
 * lexical index, publication, and allocator to agree. Awtsmoos.com accepts no
 * generation whose search truth disappears across a fresh process boundary.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

/** Resolves small Awtsmoos handles without enumerating corpus structures. */
function resolve(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}

/** Runs one optional lexical probe against persisted postings only. */
function verifyProbe(database, list, query, expectedId) {
	if (!query) return null;
	const rows = database.search.runIndexed(list, query);
	if (!rows.length) throw new Error(`native_text_probe_missing:${query}`);
	if (expectedId && !rows.some(row => String(row?.id) === String(expectedId))) {
		throw new Error(`native_text_probe_identity_missing:${expectedId}`);
	}
	return { query, matches: rows.length };
}

/**
 * Verifies one candidate after reopen without enumerating the full corpus.
 * @param {object} options Expected file, list, count, dimensions, and optional probe.
 * @returns {Promise<object>} Persisted vector, text, publication, and allocator testimony.
 */
export async function verifyNativeCandidate(options) {
	const database = new AwtsmoosDB(options.file, {
		readOnly: true,
		maxCachedPages: 8
	});
	try {
		await database.open();
		const list = database.root[options.listName];
		if (!list) throw new Error('native_candidate_list_missing');
		const count = Number(list.length || 0);
		const status = database.vector.indexStatus(list);
		const audit = database.vector.auditIndex(list);
		const publication = resolve(database.root.publication);
		const allocation = database.verify();
		const textIndexed = database.search.isIndexed(options.listName);
		if (count !== Number(options.expectedCount)) {
			throw new Error(`native_list_count_mismatch:${count}`);
		}
		if (!status.usable || status.registryCount !== count) {
			throw new Error('native_index_status_invalid');
		}
		if (!audit.ok || audit.dimensions !== Number(options.dimensions)) {
			throw new Error('native_index_audit_invalid');
		}
		if (!textIndexed) throw new Error('native_text_index_invalid');
		if (!allocation.ok) throw new Error('native_allocator_verify_invalid');
		if (Number(publication?.records || 0) !== count) {
			throw new Error('native_publication_count_invalid');
		}
		const textProbe = verifyProbe(
			database,
			list,
			options.probeQuery,
			options.probeExpectedId
		);
		return {
			count,
			status,
			audit,
			publication,
			allocation,
			textIndexed,
			textProbe
		};
	} finally {
		await database.close();
	}
}
