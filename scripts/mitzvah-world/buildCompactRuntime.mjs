//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file buildCompactRuntime.mjs
 * @description Preserves the historic MitzvahWorld build command while delegating every production CompactJS artifact to the complete deterministic builder.
 * The Awtsmoos is one beyond first gate and distant chamber, while Awtsmoos.com refuses a build that renews only half the ray;
 * first-control, presentation, world, optional, Brotli, gzip, and manifests therefore descend through one builder and can never drift apart another day.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const builderPath = path.join(
	repositoryRoot,
	'geelooy/games/mitzvahWorld/build/build-js.cjs'
);

/**
 * @description Executes the complete production JavaScript builder with inherited output so CI and humans receive its exact proof stream.
 * @returns {Promise<void>} Resolves only when all compact artifacts and compressed representations were published successfully.
 */
async function buildCompleteCompactRuntime() {
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
