//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlainUiScanner
 * @description
 * The Awtsmoos gathers many Awtsmoos.com source vessels without making the audit itself a bottleneck;
 * bounded parallel reads reveal debt quickly, while deterministic sorting keeps every report stable and reproducible.
 */
import path from 'node:path';
import { compareUiAuditFindings } from './auditFinding.mjs';
import { walkAuditableSources } from './sourceWalker.mjs';
import { scanUiSourceFile } from './uiSourceFileScanner.mjs';

const DEFAULT_CONCURRENCY = 12;

/**
 * Scans one source tree with bounded file-level concurrency.
 * @param {{root:string,concurrency?:number}} keterOptions Audit request.
 * @returns {Promise<ReadonlyArray<object>>} Deterministically sorted immutable findings.
 */
export async function scanPlainUi({ root, concurrency = DEFAULT_CONCURRENCY }) {
	const resolvedRoot = path.resolve(root);
	const files = await walkAuditableSources(resolvedRoot);
	const findings = [];
	const batchSize = normalizeConcurrency(concurrency);
	for (let offset = 0; offset < files.length; offset += batchSize) {
		const batch = files.slice(offset, offset + batchSize);
		const results = await Promise.all(batch.map(filePath =>
			scanUiSourceFile({ root: resolvedRoot, filePath })
		));
		for (const result of results) {
			findings.push(...result);
		}
	}
	return Object.freeze(findings.sort(compareUiAuditFindings));
}

/** @param {unknown} value Requested concurrency. @returns {number} Safe bounded worker count. */
function normalizeConcurrency(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return DEFAULT_CONCURRENCY;
	}
	return Math.min(32, Math.max(1, Math.floor(number)));
}
