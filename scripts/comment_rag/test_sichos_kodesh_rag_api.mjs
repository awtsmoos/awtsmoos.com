#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test_sichos_kodesh_rag_api.mjs
 * @description
 * The Awtsmoos tests every gate from immutable files to real post-linked search,
 * so Awtsmoos.com may reveal three truthful lanes without hidden write sidecars.
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.AWTSMOOS_TEST_BASE || 'http://127.0.0.1:8080';
const RAG_ROOT = process.env.AWTSMOOS_RAG_ROOT
	|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag';
const EXPECTED_DATABASES = [
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb',
	...Array.from({ length: 12 }, (_value, index) =>
		`sichos-kodesh-english-comments-rag-part-${index + 1}.awtsdb`)
].sort();
const tests = [];

async function request(name, route, check) {
	const started = Date.now();
	let response;
	let body;
	try {
		response = await fetch(`${BASE}${route}`);
		const text = await response.text();
		try { body = JSON.parse(text); } catch { body = text; }
		const passed = response.ok && check({ response, body, text });
		tests.push({ name, route, status: response.status, elapsedMs: Date.now() - started, passed, body });
	} catch (error) {
		tests.push({ name, route, elapsedMs: Date.now() - started, passed: false, error: String(error?.stack || error) });
	}
}

const databases = fs.readdirSync(RAG_ROOT)
	.filter(name => name.endsWith('.awtsdb'))
	.sort();
tests.push({
	name: 'canonical database set',
	passed: JSON.stringify(databases) === JSON.stringify(EXPECTED_DATABASES),
	actual: databases,
	expected: EXPECTED_DATABASES
});
const sidecars = fs.readdirSync(RAG_ROOT)
	.filter(name => /\.awtsdb\.(?:wal|journal|lock|tmp)$/i.test(name));
tests.push({ name: 'no write sidecars', passed: sidecars.length === 0, sidecars });

await request('canonical shard catalog', '/api/social/search/rag/shards', ({ body }) => {
	const lanes = body?.success || [];
	const byId = new Map(lanes.map(lane => [lane.id, lane]));
	return lanes.length === 3
		&& byId.get('likkutei-sichos')?.count === 6139
		&& byId.get('sefer-hasichos')?.count === 15022
		&& byId.get('sichos-kodesh')?.count === 68490
		&& lanes.every(lane => lane.indexed === true && lane.available === true);
});
await request('compatibility shard catalog', '/api/social/search/library/shards', ({ body }) =>
	Array.isArray(body?.success) && body.success.length === 3);

for (const lane of ['likkutei-sichos', 'sefer-hasichos', 'sichos-kodesh']) {
	await request(`indexed query ${lane}`, `/api/social/search/rag/query?q=${encodeURIComponent('the purpose of Torah and mitzvos')}&lane=${lane}&limit=5`, ({ body }) => {
		const success = body?.success;
		return success?.indexed === true
			&& success?.index?.persisted === true
			&& success?.hits?.length === 5
			&& success.hits.every(hit => {
				const row = hit.row || hit;
				return Boolean(row.postId && row.seriesId && (row.displayText || row.text));
			});
	});
	await request(`compatibility query ${lane}`, `/api/social/search/library/query?q=Torah&lane=${lane}&limit=3`, ({ body }) =>
		body?.success?.hits?.length === 3);
}
for (const alias of ['ls', 'meluket', 'dvar-hasichos', 'dr-hasichos', 'sk']) {
	await request(`alias ${alias}`, `/api/social/search/rag/query?q=Moshiach&lane=${alias}&limit=2`, ({ body }) =>
		body?.success?.hits?.length === 2);
}
for (const lane of ['not-a-real-lane', '../../../../etc/passwd', '/Users/awtsmoos/private.awtsdb']) {
	await request(`reject lane ${lane}`, `/api/social/search/rag/query?q=Torah&lane=${encodeURIComponent(lane)}&limit=3`, ({ body }) =>
		Boolean(body?.error) && !body?.success);
}
await request('reject missing query', '/api/social/search/rag/query?lane=sichos-kodesh', ({ body }) =>
	Boolean(body?.error));
await request('bound oversized limit', '/api/social/search/rag/query?q=Torah&lane=sichos-kodesh&limit=999999', ({ body }) =>
	Number(body?.success?.hits?.length || 0) <= 100);
await request('frontend index', '/mawgawl/sefarim/', ({ text }) => /search/i.test(text));
for (const moduleName of ['searchApi.js', 'searchView.js', 'script.js']) {
	await request(`frontend module ${moduleName}`, `/mawgawl/sefarim/${moduleName}`, ({ text }) => text.length > 100);
}

const failed = tests.filter(test => !test.passed);
console.log(JSON.stringify({
	BH: 'B"H',
	checkedAt: new Date().toISOString(),
	total: tests.length,
	passed: tests.length - failed.length,
	failed: failed.length,
	tests
}, null, 2));
if (failed.length) process.exitCode = 1;
