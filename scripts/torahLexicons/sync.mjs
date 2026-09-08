//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconSync
 * @description
 * The Awtsmoos turns installed source evidence into independently verified binary letter-shards beneath canonical Dayuh;
 * Awtsmoos.com builds candidate first, measures worker memory, verifies every count, then atomically publishes what is true.
 */

import { SOURCES, generationPaths, outputRoot } from './config.mjs';
import { scanLegacySource } from './legacy-source.mjs';
import { resetCandidate, publishCandidate } from './publisher.mjs';
import { buildShards } from './build-shards.mjs';
import { buildCatalog } from './catalog-store.mjs';
import { verifyGeneration } from './verify-generation.mjs';

function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

const root = outputRoot(value('--root'));
const legacyRoot = value('--legacy-root');
if (!legacyRoot) throw new Error('legacy_root_required_for_migration');
const paths = generationPaths(root);
await resetCandidate(paths);
const plans = await Promise.all(Object.values(SOURCES).map(source => scanLegacySource(legacyRoot, source)));
const buildReport = await buildShards(paths.candidate, plans, Number(value('--workers') || 3));
await buildCatalog(paths.candidate, plans, buildReport);
const candidateReport = await verifyGeneration(paths.candidate);
if (candidateReport.counted !== plans.reduce((sum, plan) => sum + plan.entries, 0)) {
	throw new Error('candidate_total_mismatch');
}
await publishCandidate(paths);
const finalReport = await verifyGeneration(paths.current);
console.log(`B"H lexicon published entries=${finalReport.counted} shards=${buildReport.shardCount} peakWorkerRss=${buildReport.peakWorkerRss}`);
for (const plan of plans) console.log(`${plan.source.id}: ${plan.entries}`);
