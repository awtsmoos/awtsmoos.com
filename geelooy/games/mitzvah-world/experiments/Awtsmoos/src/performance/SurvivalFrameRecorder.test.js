// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalFrameRecorder.test.js
 * @description Proves the 5-minute survival recorder reports p50/p95/worst, the 95%-inside
 * and 1%-long-frame covenant, generation-slice evidence, render-object counters with
 * honest sources, and return-to-spawn stability — without ever inventing a counter it
 * cannot source. These tests drive the recorder manually: no real frames are measured
 * here, because this VM has no WebGL and no real hardware.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	copyableSurvivalSummary,
	createSurvivalFrameRecorder,
	evaluateStability,
	extractRenderCounters,
	SURVIVAL_SIXTY_FPS_DURATION_MS
} from './SurvivalFrameRecorder.js';

function fakeEnvironment() {
	let now = 0;
	return {
		advanceTo: ms => { now = ms; },
		clock: () => now,
		performance: { memory: { usedJSHeapSize: 100 * 1024 * 1024 } }
	};
}

function driveFrames(recorder, environment, intervals) {
	let now = 1000;
	environment.advanceTo(now);
	recorder.recordFrame(now);
	for (const interval of intervals) {
		now += interval;
		environment.advanceTo(now);
		recorder.recordFrame(now);
	}
	return now;
}

test('a clean 5-minute run certifies: p95 inside 16.7ms, 95% inside budget, no long frames', () => {
	const environment = fakeEnvironment();
	const recorder = createSurvivalFrameRecorder({
		clock: environment.clock,
		durationMs: 60000,
		environment,
		runtime: fakeRuntime(),
		snapshotIntervalMs: 10000
	});
	driveFrames(recorder, environment, Array(3600).fill(16));
	recorder.recordGenerationSlice(3, 'test-slice');
	const report = recorder.finish('test-complete');
	assert.equal(report.frames.count, 3600);
	assert.equal(report.frames.p50Milliseconds, 16);
	assert.equal(report.frames.p95Milliseconds, 16);
	assert.equal(report.frames.worstMilliseconds, 16);
	assert.equal(report.frames.framesInside16_7Rate, 1);
	assert.equal(report.generation.maximumMilliseconds, 3);
	assert.equal(report.generation.supported, true);
	assert.ok(report.render.snapshots.length >= 2);
	assert.equal(report.stability.stable, true);
	assert.equal(report.certified, true);
	assert.deepEqual(report.failures, []);
});

test('p95 over 16.7ms and fewer than 95% inside budget both fail the run', () => {
	const environment = fakeEnvironment();
	const recorder = createSurvivalFrameRecorder({
		clock: environment.clock,
		durationMs: 60000,
		environment,
		runtime: fakeRuntime(),
		snapshotIntervalMs: 10000
	});
	driveFrames(recorder, environment, [...Array(180).fill(16), ...Array(20).fill(17)]);
	recorder.recordGenerationSlice(2, 'test-slice');
	const report = recorder.finish('test-complete');
	assert.equal(report.frames.p95Milliseconds, 17);
	assert.equal(report.frames.framesInside16_7Rate, 0.9);
	assert.ok(report.failures.includes('FRAME_P95_OVER_16_7_MS'));
	assert.ok(report.failures.includes('FRAMES_INSIDE_16_7_BELOW_95_PERCENT'));
	assert.equal(report.certified, false);
});

test('a missing generation slice fails closed instead of passing silently', () => {
	const environment = fakeEnvironment();
	const runtimeWithoutSlice = fakeRuntime();
	delete runtimeWithoutSlice.chunkRuntime;
	const recorder = createSurvivalFrameRecorder({
		clock: environment.clock,
		durationMs: 60000,
		environment,
		runtime: runtimeWithoutSlice,
		snapshotIntervalMs: 10000
	});
	driveFrames(recorder, environment, Array(200).fill(12));
	const report = recorder.finish('test-complete');
	assert.equal(report.generation.maximumMilliseconds, null);
	assert.equal(report.generation.supported, false);
	assert.ok(report.failures.includes('GENERATION_SLICE_UNSUPPORTED'));
	assert.equal(report.certified, false);
});

test('a generation slice over 4ms fails even when every frame is fast', () => {
	const environment = fakeEnvironment();
	const recorder = createSurvivalFrameRecorder({
		clock: environment.clock,
		durationMs: 60000,
		environment,
		runtime: fakeRuntime(),
		snapshotIntervalMs: 10000
	});
	driveFrames(recorder, environment, Array(200).fill(12));
	recorder.recordGenerationSlice(4.5, 'test-slice');
	const report = recorder.finish('test-complete');
	assert.ok(report.failures.includes('GENERATION_SLICE_OVER_4_MS'));
	assert.equal(report.certified, false);
});

test('counters come from real renderer state, with a named source for each', () => {
	const runtime = fakeRuntime();
	const { sources, values } = extractRenderCounters(runtime, fakeEnvironment());
	assert.equal(values.draws, 42);
	assert.equal(values.triangles, 9000);
	assert.equal(values.meshes, 3);
	assert.equal(values.activeChunks, 1);
	assert.equal(values.textures, 1);
	assert.equal(values.geometries, 5);
	assert.equal(values.uploadsDeferred, 0);
	assert.equal(values.uploadsPending, 0);
	assert.equal(values.heapBytes, 100 * 1024 * 1024);
	assert.equal(sources.draws, 'renderer.stats.draws');
	assert.equal(sources.activeChunks, 'chunkRuntime.diagnostics().count');
	assert.equal(sources.heapBytes, 'performance.memory.usedJSHeapSize');
});

test('counters the runtime cannot source stay null with a plain unavailable source', () => {
	const { sources, values } = extractRenderCounters({}, fakeEnvironment());
	assert.equal(values.draws, null);
	assert.equal(values.triangles, null);
	assert.equal(values.meshes, null);
	assert.equal(values.activeChunks, null);
	assert.equal(values.uploadsDeferred, null);
	assert.ok(sources.draws.startsWith('unavailable:'));
	assert.ok(sources.uploadsDeferred.startsWith('unavailable:'));
	const noHeap = extractRenderCounters({}, { performance: {} });
	assert.equal(noHeap.values.heapBytes, null);
	assert.ok(noHeap.sources.heapBytes.startsWith('unavailable:'));
});

test('stability passes when the return snapshot matches spawn and fails when counts drift', () => {
	const spawn = snapshotEntry({ draws: 40, triangles: 9000, meshes: 7, activeChunks: 1, textures: 3, heapBytes: 100000000 });
	const returned = snapshotEntry({ draws: 41, triangles: 9100, meshes: 7, activeChunks: 1, textures: 3, heapBytes: 102000000 });
	assert.equal(evaluateStability([spawn, returned]).stable, true);
	const leaked = snapshotEntry({ draws: 90, triangles: 20000, meshes: 12, activeChunks: 3, textures: 9, heapBytes: 160000000 });
	const failed = evaluateStability([spawn, leaked]);
	assert.equal(failed.stable, false);
	assert.ok(failed.failures.some(failure => failure.startsWith('STABILITY_ACTIVECHUNKS_DRIFTED')));
	assert.ok(failed.failures.some(failure => failure.startsWith('STABILITY_DRAWS_DRIFTED')));
});

test('stability is unmeasured, not passed, when a counter cannot be sourced', () => {
	const spawn = snapshotEntry({ draws: 40, triangles: null, meshes: 7, activeChunks: 1, textures: 3, heapBytes: null });
	const returned = snapshotEntry({ draws: 40, triangles: null, meshes: 7, activeChunks: 1, textures: 3, heapBytes: null });
	const result = evaluateStability([spawn, returned]);
	assert.equal(result.stable, null);
	assert.ok(result.unmeasured.includes('triangles'));
	assert.ok(result.unmeasured.includes('heapBytes'));
	assert.equal(evaluateStability([spawn]).stable, null);
});

test('the recorder auto-finishes at the 5-minute duration and publishes a paste-back summary', () => {
	const environment = fakeEnvironment();
	const recorder = createSurvivalFrameRecorder({
		clock: environment.clock,
		environment,
		runtime: fakeRuntime()
	});
	assert.equal(recorder.durationMs, SURVIVAL_SIXTY_FPS_DURATION_MS);
	assert.equal(recorder.durationMs, 300000);
	let now = 0;
	environment.advanceTo(now);
	recorder.recordFrame(now);
	for (let index = 0; index < 300; index += 1) {
		now += 1000;
		environment.advanceTo(now);
		recorder.recordFrame(now);
	}
	assert.equal(recorder.finished, true);
	assert.equal(environment.AwtsmoosSurvivalSixtyFpsReport, recorder.report);
	const summary = copyableSurvivalSummary(recorder.report);
	assert.ok(summary.includes('SURVIVAL 60 FPS — 5-minute run'));
	assert.ok(summary.includes('p95:'));
	assert.ok(summary.includes('CERTIFIED:'));
	assert.ok(summary.includes('stable after return:'));
});

function snapshotEntry(values) {
	return {
		activeChunks: values.activeChunks ?? null,
		atMs: 0,
		draws: values.draws ?? null,
		elapsedMs: 0,
		heapBytes: values.heapBytes ?? null,
		label: null,
		meshes: values.meshes ?? null,
		sources: {},
		textures: values.textures ?? null,
		triangles: values.triangles ?? null
	};
}

function fakeRuntime() {
	return {
		chunkRuntime: {
			diagnostics: () => ({
				count: 1,
				lastProcess: { longestTaskMilliseconds: 2 },
				queue: { pending: 0, stats: { uploadsDeferred: 0 } }
			}),
			registry: { size: 1 }
		},
		renderer: {
			info: { memory: { geometries: 5, textures: 3 } },
			stats: { draws: 42, triangles: 9000 }
		},
		scene: {
			children: [
				{ geometry: { attributes: { position: { count: 900 } } }, material: { map: { isTexture: true, image: { height: 64, width: 64 } } } },
				{ geometry: { attributes: { position: { count: 26100 } } }, material: null }
			],
			traverse(callback) {
				callback(this);
				for (const child of this.children) callback(child);
			}
		}
	};
}
