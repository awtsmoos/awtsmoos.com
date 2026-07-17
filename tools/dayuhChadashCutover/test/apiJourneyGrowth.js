// B"H
// Boruch Hashem
// Blessed is He

/** @file apiJourneyGrowth.js @description Proves repeated reads do not grow DosDB. */

const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const { requireSuccess } = require('./apiJourneyHttp.js');

function allocatedBytes(root) {
	const output = execFileSync('/usr/bin/du', ['-sk', root], {
		encoding: 'utf8'
	});
	return Number(output.trim().split(/\s+/)[0]) * 1024;
}

async function proveReadStability(origin, apiKey, ids, dbRoot) {
	const routes = [
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/details`,
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${ids.post}`,
		`/api/social/heichelos/${ids.heichel}/post/${ids.post}/comments/aliases`
			+ `?seriesId=${ids.series}&verseSection=root`
	];
	for (const route of routes) {
		await requireSuccess('read warmup', origin, route, { apiKey });
	}
	const before = allocatedBytes(dbRoot);
	for (let cycle = 0; cycle < 20; cycle++) {
		for (const route of routes) {
			await requireSuccess(`stable read ${cycle}`, origin, route, { apiKey });
		}
	}
	const after = allocatedBytes(dbRoot);
	assert(after - before <= 64 * 1024, (
		`read-only API traffic grew DosDB by ${after - before} bytes`
	));
	return { before, after, delta: after - before };
}

module.exports = {
	allocatedBytes,
	proveReadStability
};
