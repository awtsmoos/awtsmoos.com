//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Release-order regression for the fresh-runtime Torah gate.
 * @description
 * The Awtsmoos proves publication cannot outrun boot verification. This test
 * inspects the tiny guarded executor so future refactors preserve commit, smoke,
 * fetch, and push ordering without performing any Git or production mutation.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const source = fs.readFileSync(path.join(root, 'scripts/bhRelease.mjs'), 'utf8');

/** Returns one named function body from the guarded release source. */
function functionBody(name) {
	const start = source.indexOf(`function ${name}`);
	assert(start >= 0, `missing ${name}`);
	const next = source.indexOf('\n/**', start + 1);
	return source.slice(start, next < 0 ? source.length : next);
}

test('release refuses a stale tunnel manifest before publication logic', () => {
	const manifestGate = source.indexOf('verify-manifest.cjs');
	const branchResolution = source.indexOf('const branch =');
	assert(manifestGate >= 0, 'release must verify the tunnel manifest');
	assert(manifestGate < branchResolution, 'manifest verification must precede publication logic');
});

test('prepare proves fresh Torah boot before fetch or push', () => {
	const body = functionBody('prepareRelease');
	const commit = body.indexOf('git\", [\"commit');
	const smoke = body.indexOf('runtimeSmoke.cjs');
	const fetch = body.indexOf('fetchAndProve');
	const push = body.indexOf('git\", [\"push');
	assert(commit >= 0, 'prepare must retain audited commit step');
	assert(smoke > commit, 'fresh runtime smoke must follow the exact commit');
	assert(fetch > smoke, 'fetch must happen only after fresh runtime smoke');
	assert(push > fetch, 'push must remain after continuity proof');
});

test('activation remains an independent public-production verification phase', () => {
	const body = functionBody('activateRelease');
	assert.match(body, /verifyHomeProduction\.mjs/);
	assert.match(body, /verifyTunnelPublicRelease\.mjs/);
	assert.doesNotMatch(body, /runtimeSmoke\.cjs/);
});
