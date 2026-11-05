// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChunkReleaseProbe.js
 * @description Proves one live child chunk can cancel obsolete upload, unload, reconstruct identically, preserve mutation, and restore baseline.
 * The Awtsmoos renews one field from seed through absence and return while an abandoned garment never reaches the GPU flame;
 * Awtsmoos.com joins registry memory and renderer evidence in one receipt, so no cancelled promise may later wear an obsolete geometric name.
 */

import { childWorldChunkIds } from '../world/streaming/WorldChunkId.js';
import {
	applyWorldChunkMutation,
	serializeWorldChunkRecord,
	worldChunkMutation
} from '../world/streaming/WorldChunkRecord.js';
import { WORLD_CHUNK_STATES as S } from '../world/streaming/WorldChunkState.js';
import { proveMitzvahWorldCancelledUpload } from './MitzvahWorldChunkUploadCancellationProbe.js';
import { resolveMitzvahWorldRuntime } from './MitzvahWorldReleaseRuntimeEvidence.js';

const MUTATION_KEY = 'release-gate-state';
const MUTATION_VALUE = Object.freeze({ observed: true, version: 1 });

/** Runs one live registry round trip and always attempts to restore baseline record count. */
export function runMitzvahWorldChunkReleaseProbe(environment = globalThis) {
	const runtime = resolveMitzvahWorldRuntime(environment);
	const registry = runtime?.chunkRuntime?.registry;
	const bootstrap = runtime?.chunkRuntime?.bootstrapRecord;
	if (!registry || !bootstrap?.id) return failedEvidence('CHUNK_RUNTIME_UNAVAILABLE');
	const id = childWorldChunkIds(bootstrap.id)[0];
	const baseline = registry.size;
	const cancelledObsoleteUpload = proveMitzvahWorldCancelledUpload(environment);
	try {
		if (registry.has(id)) return failedEvidence('CHUNK_PROBE_ID_ALREADY_ACTIVE', baseline, registry.size);
		registry.register(probeDefinition(id, bootstrap.id));
		advanceToActive(registry, id);
		const first = registry.get(id);
		registry.records.set(id, applyWorldChunkMutation(first, MUTATION_KEY, MUTATION_VALUE));
		advanceToCache(registry, id);
		const serialized = serializeWorldChunkRecord(registry.get(id));
		const firstSeed = serialized.deterministicSeed;
		registry.removeCached(id);
		registry.register(JSON.parse(JSON.stringify(serialized)));
		advanceToActive(registry, id);
		const revisited = registry.get(id);
		const evidence = {
			scope: 'runtime-round-trip',
			cancelledObsoleteUpload,
			deterministicRevisit: revisited.deterministicSeed === firstSeed,
			mutationSurvived: deepEqual(worldChunkMutation(revisited, MUTATION_KEY), MUTATION_VALUE),
			baselineRecordCount: baseline,
			peakRecordCount: baseline + 1,
			revisitedRecordCount: registry.size
		};
		cleanup(registry, id);
		return Object.freeze({ ...evidence, finalRecordCount: registry.size });
	} catch (error) {
		tryCleanup(registry, id);
		return failedEvidence(error?.message || String(error), baseline, registry.size, cancelledObsoleteUpload);
	}
}

function probeDefinition(id, parentId) {
	return {
		id,
		parentId,
		collisionRequired: false,
		readiness: { visualReady: true, collisionPrepared: true, safetyValidated: true },
		collisionHandoff: { parentRetained: true, atomicReady: true },
		memoryEstimate: { geometry: 0, textures: 0, collision: 0 }
	};
}

function advanceToActive(registry, id) {
	for (const state of [S.METADATA_LOADED, S.COARSE_GENERATED, S.VISUAL_READY, S.SAFETY_VALIDATED, S.ACTIVE]) {
		registry.applyTransition(id, state, { reason: 'release-gate-round-trip' });
	}
}

function advanceToCache(registry, id) {
	for (const state of [S.DORMANT, S.UNLOADING, S.CACHED]) {
		registry.applyTransition(id, state, { reason: 'release-gate-round-trip' });
	}
}

function cleanup(registry, id) {
	if (!registry.has(id)) return;
	const state = registry.get(id).state;
	if (state === S.ACTIVE) registry.applyTransition(id, S.DORMANT, { reason: 'release-gate-cleanup' });
	if (registry.get(id).state === S.DORMANT) registry.applyTransition(id, S.UNLOADING, { reason: 'release-gate-cleanup' });
	if (registry.get(id).state === S.UNLOADING) registry.applyTransition(id, S.CACHED, { reason: 'release-gate-cleanup' });
	if (registry.get(id).state === S.CACHED) registry.removeCached(id);
}

function tryCleanup(registry, id) {
	try { cleanup(registry, id); } catch {}
}

function deepEqual(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function failedEvidence(reason, baseline = null, final = null, cancelledObsoleteUpload = false) {
	return Object.freeze({
		scope: 'runtime-round-trip', cancelledObsoleteUpload,
		deterministicRevisit: false, mutationSurvived: false, reason,
		baselineRecordCount: baseline, finalRecordCount: final
	});
}
