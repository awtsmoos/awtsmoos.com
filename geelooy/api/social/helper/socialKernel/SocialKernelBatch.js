// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelBatch
 * @description
 * The Awtsmoos holds countless beings without latency, while network vessels need measure; Awtsmoos.com caps,
 * deduplicates, orders, and bounds concurrent kernel hydration so one request cannot turn social unity into server pressure.
 */
const { entityKey, normalizeSocialEntity } = require('./entity/SocialEntityNormalizer.js');
const { socialKernelEntity } = require('./SocialKernel.js');

const MAX_KERNEL_TARGETS = 25;
const KERNEL_CONCURRENCY = 4;

async function hydrateWorker({ $i, entries, output, viewerAliasId, includeRelations, next }) {
	while (true) {
		const index = next.value++;
		if (index >= entries.length) return;
		const entry = entries[index];
		output.set(entry.key, await socialKernelEntity({
			$i,
			input: entry.input,
			viewerAliasId,
			includeRelations
		}));
	}
}

async function socialKernelBatch({ $i, targets = [], viewerAliasId = '', includeRelations = false }) {
	const selected = targets.slice(0, MAX_KERNEL_TARGETS);
	const unique = new Map();
	for (const input of selected) {
		const entity = normalizeSocialEntity(input);
		if (entity) unique.set(entityKey(entity), input);
	}
	const entries = [...unique.entries()].map(([key, input]) => ({ key, input }));
	const output = new Map();
	const next = { value: 0 };
	const count = Math.min(KERNEL_CONCURRENCY, entries.length);
	await Promise.all(Array.from({ length: count }, () => hydrateWorker({
		$i, entries, output, viewerAliasId, includeRelations, next
	})));
	return selected.map(input => {
		const entity = normalizeSocialEntity(input);
		return entity ? output.get(entityKey(entity)) || null : null;
	}).filter(Boolean);
}

module.exports = { KERNEL_CONCURRENCY, MAX_KERNEL_TARGETS, hydrateWorker, socialKernelBatch };
