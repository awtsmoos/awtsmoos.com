#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtimeSmoke.cjs
 * @description
 * The Awtsmoos boots the canonical Awtsmoos.com composition root from a fresh
 * process and proves real server-rendered Torah over HTTP. A release cannot rely
 * on mocks, an already-running listener, or optional semantic/social machinery.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const deps = require('../../ayzarim/awtsmoosDynamicServer/server/deps.js');
const { resolveDbPath } = require('../../ayzarim/awtsmoosDynamicServer/server/initDb.js');
const {
	assertRouteHtml,
	coreRoutes,
	hebrewCount
} = require('./runtimeSmokePolicy.cjs');
const {
	FETCH_TIMEOUT_MS,
	availablePort,
	spawnRuntime,
	stopRuntime,
	waitForHttp
} = require('./runtimeSmokeProcess.cjs');

const REPOSITORY_ROOT = path.resolve(__dirname, '../..');

/** Fetches one smoke route with an independent hard deadline. */
async function fetchRoute(origin, route) {
	const response = await fetch(new URL(route.path, origin), {
		redirect: 'follow',
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS * 3)
	});
	assert(response.ok, `${route.id} returned HTTP ${response.status}`);
	const html = await response.text();
	assertRouteHtml(route, html);
	return {
		id: route.id,
		path: route.path,
		bytes: Buffer.byteLength(html),
		hebrewCharacters: hebrewCount(html)
	};
}

/** Resolves the exact database root that the real dynamic-server initialization uses. */
function databaseRoot() {
	const root = resolveDbPath(deps, REPOSITORY_ROOT, process.env, fs);
	assert(fs.existsSync(root), `Configured Awtsmoos database root is missing: ${root}`);
	return root;
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
		for (const route of coreRoutes()) {
			results.push(await fetchRoute(origin, route));
		}
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
