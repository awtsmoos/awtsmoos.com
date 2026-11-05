// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeResourceSnapshot.js
 * @description Samples renderer, streaming, memory, and scene resources without blocking play.
 * The Awtsmoos knows every object instantly; Awtsmoos.com counts them through idle batches so
 * a performance witness can never become the silent stall it was created to expose.
 */

import { emptyRuntimeSceneMetrics } from './RuntimeSceneResourceScan.js';
import { RuntimeSceneResourceScanTask } from './RuntimeSceneResourceScanTask.js';

const STATIC_SCAN_INTERVAL_MS = 5000;
const SCAN_BATCH_SIZE = 128;

export class RuntimeResourceSnapshot {
	constructor(environment = globalThis) {
		this.environment = environment;
		this.lastSceneScanAt = -Infinity;
		this.scene = emptyRuntimeSceneMetrics();
		this.sceneTask = null;
		this.sceneScanScheduled = false;
		this.memoryBaseline = null;
	}

	collect(runtime, costs = {}, now = performance.now()) {
		this.ensureSceneScan(runtime.scene, now);
		const renderer = runtime.renderer || {};
		const stats = renderer.stats || renderer.info?.render || {};
		return {
			activeMaterials: this.scene.activeMaterials,
			animationCostMilliseconds: finiteOrNull(costs.animationMilliseconds),
			drawCalls: finiteOrZero(stats.draws ?? stats.calls),
			garbageCollection: { available: false, stallMilliseconds: null },
			gpuFrameTime: gpuEvidence(stats),
			memory: memoryEvidence(this),
			objectCount: this.scene.objectCount,
			renderSubmissionMilliseconds: finiteOrNull(costs.renderSubmissionMilliseconds),
			shadowCostMilliseconds: finiteOrNull(costs.shadowMilliseconds),
			streaming: streamingEvidence(runtime, costs),
			textureCount: this.scene.textureCount,
			textureMemoryBytesEstimate: this.scene.textureMemoryBytesEstimate,
			triangles: finiteOrZero(stats.triangles) || this.scene.triangles,
			vegetationCostMilliseconds: finiteOrNull(costs.vegetationMilliseconds),
			waterCostMilliseconds: finiteOrNull(costs.waterMilliseconds)
		};
	}

	ensureSceneScan(scene, now) {
		if (!this.sceneTask && now - this.lastSceneScanAt < STATIC_SCAN_INTERVAL_MS) return;
		if (!this.sceneTask) this.sceneTask = new RuntimeSceneResourceScanTask(scene);
		this.scheduleSceneChunk();
	}

	scheduleSceneChunk() {
		if (this.sceneScanScheduled || !this.sceneTask) return;
		this.sceneScanScheduled = true;
		scheduleIdle(this.environment, () => {
			this.sceneScanScheduled = false;
			if (!this.sceneTask) return;
			const progress = this.sceneTask.step(SCAN_BATCH_SIZE);
			this.scene = publicSceneMetrics(progress);
			if (progress.complete) {
				this.sceneTask = null;
				this.lastSceneScanAt = now();
				return;
			}
			this.scheduleSceneChunk();
		});
	}
}

function streamingEvidence(runtime, costs) {
	return {
		chunk: runtime.chunkRuntime?.diagnostics?.() || null,
		costMilliseconds: finiteOrNull(costs.streamingMilliseconds),
		stalls: runtime.chunkRuntime?.stats?.streamingStalls ?? null
	};
}

function memoryEvidence(sampler) {
	const memory = performance.memory;
	if (!memory) return { available: false, growthBytes: null, usedBytes: null };
	sampler.memoryBaseline ??= memory.usedJSHeapSize;
	return {
		available: true,
		growthBytes: memory.usedJSHeapSize - sampler.memoryBaseline,
		usedBytes: memory.usedJSHeapSize
	};
}

function publicSceneMetrics(progress) {
	const { complete, remainingObjects, ...metrics } = progress;
	return metrics;
}

function scheduleIdle(environment, callback) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(callback, { timeout: 1000 });
		return;
	}
	environment.setTimeout?.(callback, 0) ?? callback();
}

function gpuEvidence(stats) {
	const milliseconds = finiteOrNull(stats.gpuFrameMilliseconds);
	return { available: milliseconds !== null, milliseconds };
}

function finiteOrNull(value) {
	return Number.isFinite(value) ? Number(value) : null;
}

function finiteOrZero(value) {
	return Number.isFinite(value) ? Number(value) : 0;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
