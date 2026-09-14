//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahLexiconSync
 * @description
 * Completed native source databases become independently verified binary
 * serving shards beneath canonical Dayuh. Candidate publication must prove
 * every source count before one atomic generation promotion can occur.
 */

import {
	SOURCES,
	generationPaths,
	outputRoot,
	sourceRoot
} from './config.mjs';
import { sourcePlans } from './source-database.mjs';
import { resetCandidate, publishCandidate } from './publisher.mjs';
import { buildShards } from './build-shards.mjs';
import { buildCatalog } from './catalog-store.mjs';
import { verifyGeneration } from './verify-generation.mjs';

/** Reads one scalar CLI value without introducing a mutable command framework. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

const output = outputRoot(value('--root'));
const sources = sourceRoot(value('--source-root'));
const paths = generationPaths(output);

await resetCandidate(paths);
const plans = await sourcePlans(sources, SOURCES);
const buildReport = await buildShards(
	paths.candidate,
	plans,
	Number(value('--workers') || 3)
);

await buildCatalog(paths.candidate, plans, buildReport);
const candidateReport = await verifyGeneration(paths.candidate);
const expectedEntries = plans.reduce(
	(sum, plan) => sum + plan.entries,
	0
);
if (candidateReport.counted !== expectedEntries) {
	throw new Error('candidate_total_mismatch');
}

await publishCandidate(paths);
const finalReport = await verifyGeneration(paths.current);
console.log(
	`B"H lexicon published entries=${finalReport.counted} shards=${buildReport.shardCount} peakWorkerRss=${buildReport.peakWorkerRss}`
);
for (const plan of plans) {
	console.log(`${plan.source.id}: ${plan.entries}`);
}
