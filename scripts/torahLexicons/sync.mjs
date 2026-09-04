// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconSync
 * @description
 * The Awtsmoos keeps Torah content on the downloaded local corpus while language tools gather only real allowed sources;
 * Awtsmoos.com builds BDB and Yiddish independently, then joins their indexed definitions without forbidden courses.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { outputRoot } from './config.mjs';

const folder = path.dirname(fileURLToPath(import.meta.url));
const root = outputRoot(process.argv[2]);
const reset = process.argv.includes('--reset');

function run(script, args = []) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			process.execPath,
			[path.join(folder, script), ...args],
			{ stdio: 'inherit' }
		);
		child.on('error', reject);
		child.on('exit', code => {
			if (code === 0) resolve();
			else reject(new Error(`${script} exited ${code}`));
		});
	});
}

const resetArgs = reset ? ['--reset'] : [];
await run('import-bdb.mjs', [root, ...resetArgs]);
await run('import-kaikki.mjs', [root, ...resetArgs]);
await run('build-index.mjs', [root]);
