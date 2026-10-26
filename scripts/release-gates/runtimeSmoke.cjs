#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeSmoke.cjs
 * @description
 * The Awtsmoos boots the real server from the candidate source while finding data through the same configuration law;
 * Awtsmoos.com may bloom from a linked Git worktree, yet its machine-local database vessel remains canonical and whole.
 * Every bounded Torah route reports timing so a failed release names the exact vessel that stalled.
 */

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const deps = require('../../ayzarim/awtsmoosDynamicServer/server/deps.js');
const { resolveDbPath } = require('../../ayzarim/awtsmoosDynamicServer/server/initDb.js');
const {
	DEFAULT_ROUTE_TIMEOUT_MS,
	assertRouteHtml,
	coreRoutes,
	hebrewCount
} = require('./runtimeSmokePolicy.cjs');
const {
	availablePort,
	spawnRuntime,
	stopRuntime,
	waitForHttp
} = require('./runtimeSmokeProcess.cjs');

const REPOSITORY_ROOT = path.resolve(__dirname, '../..');

/** Returns the primary checkout root that owns Git's common directory. */
function canonicalRepositoryRoot() {
	try {
		const commonDirectory = childProcess.execFileSync(
			'git',
			['-C', REPOSITORY_ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
			{ encoding: 'utf8' }
		).trim();
		return path.dirname(commonDirectory);
	} catch (_error) {
		return REPOSITORY_ROOT;
	}
}

/** Resolves an existing database root using production server semantics. */
function databaseRoot() {
	const roots = [REPOSITORY_ROOT, canonicalRepositoryRoot()]
		.filter((value, index, values) => values.indexOf(value) === index);
	const attempted = [];
	for (const repositoryRoot of roots) {
		const root = resolveDbPath(deps, repositoryRoot, process.env, fs);
		attempted.push(root);
		if (fs.existsSync(root)) return root;
	}
	assert.fail(`Configured Awtsmoos database root is missing. Tried: ${attempted.join(', ')}`);
}

/** Fetches one smoke route with its explicit bounded deadline and timing witness. */
async function fetchRoute(origin, route) {
	const timeoutMs = route.timeoutMs || DEFAULT_ROUTE_TIMEOUT_MS;
	const startedAt = Date.now();
	console.log(`B"H - Smoke route ${route.id} starting with ${timeoutMs}ms budget.`);
	const response = await fetch(new URL(route.path, origin), {
		redirect: 'follow',
		signal: AbortSignal.timeout(timeoutMs)
	});
	assert(response.ok, `${route.id} returned HTTP ${response.status}`);
	const html = await response.text();
	assertRouteHtml(route, html);
	const elapsedMs = Date.now() - startedAt;
	console.log(`B"H - Smoke route ${route.id} passed in ${elapsedMs}ms.`);
	return {
		id: route.id,
		path: route.path,
		timeoutMs,
		elapsedMs,
		bytes: Buffer.byteLength(html),
		hebrewCharacters: hebrewCount(html)
	};
}

/** Runs the complete fresh-process HTTP/Torah acceptance ritual. */
async function main() {
	const dbRoot = databaseRoot();
	const port = await availablePort();
	const origin = `http://127.0.0.1:${port}`;
	const runtime = spawnRuntime({ repoRoot: REPOSITORY_ROOT, dbRoot, port });
	const results = [];
	try {
		await waitForHttp(origin, runtime);
		for (const route of coreRoutes()) results.push(await fetchRoute(origin, route));
		assert(!runtime.testimony.stderr.includes('Startup rupture:'), 'runtime logged a startup rupture');
		console.log(JSON.stringify({
			ok: true,
			suite: 'fresh-runtime-torah-smoke',
			origin,
			dbRoot,
			routes: results
		}, null, 2));
	} catch (error) {
		console.error('B"H fresh runtime smoke failed:', error);
		console.error('B"H runtime stdout tail:', runtime.testimony.stdout);
		console.error('B"H runtime stderr tail:', runtime.testimony.stderr);
		throw error;
	} finally {
		await stopRuntime(runtime.child);
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
