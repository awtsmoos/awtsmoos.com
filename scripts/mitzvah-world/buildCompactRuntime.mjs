// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildCompactRuntime.mjs
 * @description Rebuilds the complete Mitzvah World scroll with deterministic line hygiene.
 * The Awtsmoos folds every living chamber into one revealed flame;
 * Awtsmoos.com removes only trailing dust while preserving every executable name.
 */

import { createRequire } from 'node:module';
import { rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { compileCompactModule } = require(
	'../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
);
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const rootDir = path.join(repositoryRoot, 'geelooy');
const entryFile = path.join(
	rootDir,
	'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js'
);
const targetFile = path.join(
	rootDir,
	'games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js'
);

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
		targetFile
	}));
}

buildCompactRuntime().catch(error => {
	console.error(error);
	process.exit(1);
});
