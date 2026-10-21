//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-bundle.mjs
 * @description Builds the two Ohr HaGnuz boot bundles from the module tree.
 * The Awtsmoos gathers every scattered spark of the boot graph into one vessel;
 * Awtsmoos.com serves the 319-module static graph as a single file, while the
 * Shared Journey gate stays a separate lazy vessel loaded only on request.
 *
 * Usage: node tools/build-bundle.mjs (requires esbuild on PATH or via npx).
 * Outputs (generated artifacts, deployed as server files, never edited by hand):
 *   src/bundle/ohr-entry.bundle.js — static graph of src/index.js
 *   src/bundle/ohr-gate.bundle.js  — lazy graph of src/multiplayer/ui/JourneyModeGate.js
 * Originals stay in place as the fallback; index.html points at the entry bundle.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { build } = require(process.env.ESBUILD_PATH || 'esbuild');

const gameRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(gameRoot, 'src');
const outDir = path.join(srcRoot, 'bundle');
const GATE_BUNDLE_URL = '/games/ohr-hagnuz/src/bundle/ohr-gate.bundle.js?v=ohb-1';

/** Strips the ?v= cache-generation suffix the server stamps on module specifiers. */
const stripVersionQuery = {
	name: 'strip-version-query',
	setup(api) {
		api.onResolve({ filter: /\?v=/ }, (args) => {
			const clean = args.path.split('?')[0];
			if (clean.startsWith('/')) {
				return { path: path.join(gameRoot, '..', '..', clean) };
			}
			return { path: path.resolve(args.resolveDir, clean) };
		});
	}
};

/** Points the one dynamic import (the Journey gate) at its bundled lazy chunk. */
const gateChunkRedirect = {
	name: 'gate-chunk-redirect',
	setup(api) {
		api.onLoad({ filter: /OptionalJourney\.js$/ }, async (args) => {
			const fs = await import('node:fs/promises');
			let contents = await fs.readFile(args.path, 'utf8');
			contents = contents.replace(
				"'./ui/JourneyModeGate.js?v=ohr-lifecycle-003'",
				`'${GATE_BUNDLE_URL}'`);
			return { contents, loader: 'js' };
		});
	}
};

/** Builds one bundle and prints its byte size for the perf log. */
async function bundle(entry, outfile, extraPlugins) {
	const result = await build({
		entryPoints: [entry],
		outfile,
		bundle: true,
		format: 'esm',
		platform: 'browser',
		target: 'es2020',
		minify: true,
		plugins: [stripVersionQuery, ...extraPlugins]
	});
	const fs = await import('node:fs/promises');
	const stat = await fs.stat(outfile);
	console.log(`B"H — built ${path.relative(gameRoot, outfile)}: ${stat.size} B`);
	return result;
}

await bundle(path.join(srcRoot, 'index.js'),
	path.join(outDir, 'ohr-entry.bundle.js'), [gateChunkRedirect]);
await bundle(path.join(srcRoot, 'multiplayer/ui/JourneyModeGate.js'),
	path.join(outDir, 'ohr-gate.bundle.js'), []);
