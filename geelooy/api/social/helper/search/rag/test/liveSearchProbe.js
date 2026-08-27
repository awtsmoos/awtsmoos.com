// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file liveSearchProbe.js
 * @description
 * The real device corpus is discovered without secrets, opened read-only, queried,
 * and recorded in the current repair evidence folder.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { availableShards } = require('../shards.js');
const { ragSearch } = require('../search.js');

const evidence = path.resolve(
	__dirname,
	'../../../../../../../ai-thoughts/2026-07-14-150249-home-search-css-conflict-repair/09_live_search_probe.json'
);

function discoverDatabaseRoots(start) {
	const queue = [{ directory: start, depth: 0 }];
	const roots = [];
	while (queue.length) {
		const current = queue.shift();
		if (current.depth > 8) continue;
		let entries;
		try {
			entries = fs.readdirSync(current.directory, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (!entry.isDirectory() || skip(entry.name)) continue;
			const child = path.join(current.directory, entry.name);
			if (entry.name === 'comment-rag' && path.basename(path.dirname(child)) === 'ai') {
				roots.push(path.dirname(path.dirname(child)));
				continue;
			}
			queue.push({ directory: child, depth: current.depth + 1 });
		}
	}
	return [...new Set(roots)];
}

function skip(name) {
	return ['.git', 'node_modules', 'Library', '.Trash', '.cache'].includes(name);
}

async function findLiveRoot() {
	const candidates = [
		process.env.AWTS_DB_ROOT,
		...discoverDatabaseRoots('/Users/awtsmoos/Documents')
	].filter(Boolean);
	for (const directory of candidates) {
		const $i = { db: { directory } };
		const shards = await availableShards({ $i });
		if (shards.some(shard => shard.count > 0)) return { directory, shards };
	}
	return { directory: null, shards: [] };
}

async function probe() {
	const live = await findLiveRoot();
	assert(live.directory, 'No live comment-rag database root was discovered.');
	const first = live.shards.find(shard => shard.count > 0);
	assert(first, 'No readable non-empty shard was discovered.');
	const result = await ragSearch({
		$i: { db: { directory: live.directory } },
		query: 'kohen gadol',
		lane: first.id,
		strategy: 'text',
		includeComments: false,
		limit: 5,
		autoInstall: false
	});
	for (const hit of result.hits) {
		assert(String(hit.row?.displayText || '').trim(), 'Search hit lacks displayText.');
	}
	return {
		BH: 'B"H',
		ok: true,
		directory: live.directory,
		shards: live.shards.map(shard => ({ id: shard.id, count: shard.count })),
		query: result.query,
		mode: result.mode,
		message: result.message,
		hits: result.hits.map(hit => ({
			score: hit.score,
			sourceLabel: hit.row.sourceLabel,
			title: hit.row.title,
			displayText: hit.row.displayText.slice(0, 280)
		}))
	};
}

probe().then(result => {
	fs.writeFileSync(evidence, JSON.stringify(result, null, 2));
	console.log('liveSearchProbe passed');
}).catch(error => {
	fs.writeFileSync(evidence, JSON.stringify({
		BH: 'B"H',
		ok: false,
		error: error.message,
		stack: error.stack
	}, null, 2));
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
