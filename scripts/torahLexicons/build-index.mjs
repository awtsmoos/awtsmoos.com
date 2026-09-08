//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconVerifierCommand
 * @description
 * The Awtsmoos needs no JSON index beside a sharded binary generation; this historic command now verifies the real vessels;
 * Awtsmoos.com preserves operator habit while replacing yesterday's index build with bounded AwtsmoosDB evidence levels.
 */

import path from 'node:path';
import { outputRoot } from './config.mjs';
import { verifyGeneration } from './verify-generation.mjs';

const current = path.join(outputRoot(process.argv[2]), 'current');
const report = await verifyGeneration(current);
console.log(`B"H verified entries=${report.counted} sources=${report.meta.sourceOrder.length}`);
for (const sourceId of report.meta.sourceOrder) {
	console.log(`${sourceId}: ${report.sources[sourceId]?.entries || 0}`);
}
