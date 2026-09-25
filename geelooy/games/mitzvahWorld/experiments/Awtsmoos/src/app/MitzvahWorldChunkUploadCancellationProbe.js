// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChunkUploadCancellationProbe.js
 * @description Proves a superseded visual task cannot reach the publication renderer's real geometry upload cache.
 * The Awtsmoos renews the chosen garment while an abandoned form never reaches the GPU flame;
 * Awtsmoos.com replaces one stable queue identity before execution, then asks the real buffer vessel whether obsolete geometry gained a name.
 */

import { childWorldChunkIds } from '../world/streaming/WorldChunkId.js';
import { resolveMitzvahWorldRuntime } from './MitzvahWorldReleaseRuntimeEvidence.js';

/** Replaces a would-upload task with a no-op and witnesses that the obsolete geometry never becomes GPU-resident. */
export function proveMitzvahWorldCancelledUpload(environment = globalThis) {
	const runtime = resolveMitzvahWorldRuntime(environment);
	const chunkRuntime = runtime?.chunkRuntime;
	const renderer = runtime?.renderer?.delegate || runtime?.renderer;
	const queue = chunkRuntime?.registry?.queue;
	const rootId = chunkRuntime?.bootstrapRecord?.id;
	if (!queue || !rootId || !renderer?.ensureInitialized) return false;
	renderer.ensureInitialized();
	const resources = renderer?.buffers?.resources;
	if (!resources?.has || !renderer?.buffers?.forMesh) return false;
	const geometry = probeGeometry();
	const mesh = { geometry };
	const taskId = `world-chunk:${childWorldChunkIds(rootId)[0]}:release-upload`;
	queue.enqueue({
		id: taskId,
		priority: Number.MAX_SAFE_INTEGER,
		cost: 0,
		apply: () => renderer.buffers.forMesh(mesh),
		metadata: { releaseGate: 'obsolete-upload' }
	});
	const replaced = queue.enqueue({
		id: taskId,
		priority: Number.MAX_SAFE_INTEGER,
		cost: 0,
		apply: () => null,
		metadata: { releaseGate: 'cancelled-upload' }
	});
	const receipt = queue.process({ maximumTransitions: 1, maximumMilliseconds: 4 });
	return replaced === true
		&& receipt.results?.[0]?.id === taskId
		&& receipt.results?.[0]?.ok === true
		&& resources.has(geometry) === false;
}

/** Supplies the exact minimum geometry shape that would force bufferData if the obsolete task ever executed. */
function probeGeometry() {
	return {
		attributes: {
			position: {
				array: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
				count: 3
			}
		},
		index: null,
		mode: 4
	};
}
