//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file build.mjs
 * @description
 * The Awtsmoos converts approved legacy publication witnesses into one native
 * catalog. Awtsmoos.com treats manifests only as migration input here; runtime
 * discovery reads the verified AwtsmoosDB generation instead.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { removeStaleCandidateWals } from './catalogCleanup.mjs';
import { descriptorFor } from './descriptor.mjs';
import { generationFor, writeCandidate } from './catalogWriter.mjs';
import { publishCandidate, removeCandidate } from './catalogPublisher.mjs';
import { verifyCatalog } from './verify.mjs';

const require = createRequire(import.meta.url);
const Manifest = require('../../../geelooy/api/social/helper/search/rag/shardManifest.js');
const Paths = require('../../../geelooy/api/social/helper/search/rag/paths.js');
const CatalogPaths = require('../../../geelooy/api/social/helper/search/rag/publicationCatalogPaths.js');
const { configuredRoot } = require('../../../geelooy/api/social/helper/search/rag/warmupRoot.js');
const root = path.resolve(process.argv[2] || process.env.AWTS_DB_ROOT || configuredRoot());
const $i = { db: { directory: root } };
const target = CatalogPaths.publicationCatalogPath($i);
const candidate = `${target}.candidate-${process.pid}`;
const previous = `${target}.previous`;
const roots = {
	live: Paths.ragRoot($i),
	'sichos-staging': Paths.sichosKodeshStagingRoot($i),
	'likkutei-staging': Paths.likkuteiSichosStagingRoot($i)
};

const descriptors = Manifest.shardFiles($i)
	.map(Manifest.describeFile)
	.map(shard => descriptorFor(shard, roots))
	.sort((left, right) => left.databaseName.localeCompare(right.databaseName));

if (!descriptors.length) throw new Error('B"H no approved RAG publications were found');
if (descriptors.length > 128) throw new Error('B"H approved publication count exceeds hard catalog budget');

const generation = generationFor(descriptors);
await fs.mkdir(path.dirname(target), { recursive: true });
await removeStaleCandidateWals(target);
await removeCandidate(candidate);
await writeCandidate(candidate, descriptors, generation);
await verifyCatalog(candidate, descriptors.length, generation);
await publishCandidate(candidate, target, previous, descriptors.length, generation);
await removeStaleCandidateWals(target);

console.log(`B"H native RAG catalog active generation=${generation} publications=${descriptors.length}`);
