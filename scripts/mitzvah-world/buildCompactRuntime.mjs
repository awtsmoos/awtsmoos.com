// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildCompactRuntime.mjs
 * @description Preserves the historic MitzvahWorld build command while publishing CompactJS and one release-critical grass asset through deterministic builders.
 * The Awtsmoos gathers code and essential garment beneath one release covenant;
 * Awtsmoos.com refuses a build whose playable scripts and offline grass cannot descend together from the same command.
 */

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const gameRoot = path.join(repositoryRoot, 'geelooy/games/mitzvahWorld');
const builderPath = path.join(gameRoot, 'build/build-js.cjs');
const require = createRequire(import.meta.url);
const { buildEssentialReleaseAssets } = require(
	path.join(gameRoot, 'build/EssentialReleaseAssetBuilder.cjs')
);

/** Builds ignored binary release assets first, then every canonical CompactJS artifact. */
async function buildCompleteCompactRuntime() {
	const essentialAssets = await buildEssentialReleaseAssets(gameRoot);
	console.log(JSON.stringify({ essentialAssets }));
	await runCompactBuilder();
}

/** Executes the complete production JavaScript builder with inherited output. */
async function runCompactBuilder() {
	await new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [builderPath], {
			cwd: repositoryRoot,
			stdio: 'inherit'
		});
		child.once('error', reject);
		child.once('exit', code => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`MITZVAHWORLD_COMPACT_BUILD_FAILED:${code}`));
		});
	});
}

buildCompleteCompactRuntime().catch(error => {
	console.error(error);
	process.exit(1);
});
