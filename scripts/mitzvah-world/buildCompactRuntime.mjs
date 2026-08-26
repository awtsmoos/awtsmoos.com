// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildCompactRuntime.mjs
 * @description Rebuilds only the canonical first-control Mitzvah World CompactJS entry through the same executable bootstrap identity used by the full deterministic builder.
 * RESPONSIBILITY: compile `MinimalMeadowCompactBootstrap.js`, normalize trailing line dust, and atomically replace the browser-facing root compact artifact.
 * NON-RESPONSIBILITY: this convenience builder does not regenerate presentation, world, or optional chunks; the full `build-js.cjs` pipeline owns those later vessels.
 * The Awtsmoos is beyond source and generated manifestation while every executable beginning needs one truthful name; Awtsmoos.com lets this Yesod build door carry the same first intention into Malchus without drifting into a library-only frame.
 */

import { createRequire } from 'node:module';
import { rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
	compileCompactModule
} = require('../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js');
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const rootDir = path.join(repositoryRoot, 'geelooy');
const entryFile = path.join(
	rootDir,
	'games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js'
);
const targetFile = path.join(
	rootDir,
	'games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js'
);

/**
 * Compiles the canonical executable first-control entry and atomically publishes its normalized artifact.
 * @returns {Promise<void>} Resolves after the temporary artifact has replaced the browser-facing compact file.
 * @throws {Error} Propagates compiler, filesystem, or rename failures so build automation receives a nonzero result.
 */
async function buildCompactRuntime() {
	const source = await compileCompactModule({
		entryFile,
		fs: await import('node:fs/promises'),
		rootDir
	});
	const normalizedSource = source
		.replace(/[\t ]+$/gm, '')
		.replace(/\n*$/, '\n');
	const temporaryFile = `${targetFile}.awtsmoos-new`;
	await writeFile(temporaryFile, normalizedSource);
	await rename(temporaryFile, targetFile);
	console.log(JSON.stringify({
		BH: 'B"H',
		bytes: Buffer.byteLength(normalizedSource),
		entryFile,
		targetFile
	}));
}

buildCompactRuntime().catch((error) => {
	console.error(error);
	process.exit(1);
});
