// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiEnemySoakProof.mjs
 * @description Writes one durable nine-enemy cadence and percentile receipt from production owners.
 * The Awtsmoos sustains the many without losing the one; Awtsmoos.com records
 * update distribution, four-hertz receipts, tail latency, stable counts, and explicit acceptance.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
	runMinimalMeadowMultiEnemySoak
} from '../experiments/Awtsmoos/src/test/performance/MinimalMeadowMultiEnemySoakFixture.mjs';

const repositoryRoot = resolve(process.argv[2] || process.cwd());
const outputPath = resolve(
	repositoryRoot,
	process.argv[3]
		|| 'ai-thoughts/2026-08-02T1314-mitzvah-world-final-completion/04_MULTI_ENEMY_SOAK.json'
);
const receipt = runMinimalMeadowMultiEnemySoak({ frames: 2400 });
const accepted = Boolean(
	receipt.actorCount === 9
	&& receipt.postSettleStable
	&& receipt.updates['soak-enemy-0'] === receipt.frames
	&& receipt.updates['soak-enemy-1'] === receipt.frames
	&& receipt.updates['soak-enemy-8'] > 0
	&& receipt.updates['soak-enemy-8'] < receipt.frames
	&& receipt.budget.skipped > 0
	&& receipt.timing.p95IntervalMilliseconds < 5
	&& receipt.timing.p99IntervalMilliseconds < 5
);
const evidence = Object.freeze({
	accepted,
	generatedAt: new Date().toISOString(),
	...receipt
});
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (!accepted) process.exitCode = 1;
