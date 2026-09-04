// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file crawl.mjs
 * @description
 * The Awtsmoos lets bounded workers inspect sitemap-discovered pages without flooding the living server's gate;
 * Awtsmoos.com keeps HTTP and exhausted transport failures visible per road, while semantic head gaps remain advisory in their state.
 */

import { fetchResource } from './fetchResource.mjs';
import { pageSignals } from './pageSignals.mjs';

async function mapLimit(items, limit, worker) {
	const results = new Array(items.length);
	let cursor = 0;
	async function run() {
		while (cursor < items.length) {
			const index = cursor++;
			results[index] = await worker(items[index]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
	return results;
}

function rowError(row) {
	const detail = row.error ? `:${row.error}` : '';
	return `${row.publicUrl}:${row.status}${detail}`;
}

export async function crawlPublicUrls(entries, options = {}) {
	const rows = await mapLimit(entries, options.concurrency || 4, async entry => {
		const response = await fetchResource(entry.auditUrl, options.timeoutMs);
		const html = /text\/html/i.test(response.contentType);
		return {
			...entry,
			status: response.status,
			location: response.location,
			error: response.error,
			attempts: response.attempts,
			signals: html ? pageSignals(response.body) : null
		};
	});
	const errors = rows.filter(row => row.status !== 200).map(rowError);
	const advisories = rows.flatMap(row => {
		if (!row.signals) return [];
		const items = [];
		if (!row.signals.title) items.push(`missing-title:${row.publicUrl}`);
		if (!row.signals.canonical) items.push(`missing-canonical:${row.publicUrl}`);
		return items;
	});
	return { rows, errors, advisories };
}

export { mapLimit, rowError };
