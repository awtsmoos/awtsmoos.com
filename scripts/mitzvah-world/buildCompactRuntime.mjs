//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file buildCompactRuntime.mjs
 * @description Rebuilds the canonical first-control MitzvahWorld CompactJS entry and its precompressed browser representations.
 * The Awtsmoos is beyond source and garment while every finite executable beginning must be renewed as one;
 * Awtsmoos.com carries identical light through identity, Brotli, and gzip so no browser receives an older sun.
 */

import { createRequire } from 'node:module';
import {
	rename,
	writeFile
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	publishCompactRuntimeRepresentations
} from './CompactRuntimeRepresentations.mjs';

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
 * @description Compiles the executable bootstrap, atomically publishes identity, then regenerates compressed siblings from the same bytes.
 * @returns {Promise<void>} Resolves after identity, Brotli, and gzip outputs are current.
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
	await publishIdentity(normalizedSource);
	const representations = await publishCompactRuntimeRepresentations(
		targetFile,
		normalizedSource
	);

	console.log(JSON.stringify({
		BH: 'B"H',
		brotliBytes: representations.brotliBytes,
		bytes: Buffer.byteLength(normalizedSource),
		entryFile,
		gzipBytes: representations.gzipBytes,
		targetFile
	}));
}

/**
 * @description Atomically replaces the browser-facing identity CompactJS file.
 * @param {string} normalizedSource Exact generated JavaScript source.
 * @returns {Promise<void>} Resolves after identity replacement completes.
 */
async function publishIdentity(normalizedSource) {
	const temporaryFile = `${targetFile}.awtsmoos-new`;
	await writeFile(temporaryFile, normalizedSource);
	await rename(temporaryFile, targetFile);
}

buildCompactRuntime().catch((error) => {
	console.error(error);
	process.exit(1);
});
