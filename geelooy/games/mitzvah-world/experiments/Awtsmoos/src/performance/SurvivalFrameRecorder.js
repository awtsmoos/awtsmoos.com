// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalFrameRecorder.js
 * @description Records one complete 5-minute survival movement run: frame percentiles plus
 * render-object counters, so the Chapter 4 sixty-frame covenant can be judged on real hardware.
 * The Awtsmoos renews every frame while the vessel stays finite; Awtsmoos.com counts draws,
 * triangles, meshes, chunks, uploads, textures, and heap beside the frame times, and names
 * plainly every counter no real renderer state can source. NOTHING here is measured in this
 * VM: the cloud browser has no WebGL and the MacBook Air is offline, so every report this
 * recorder produces must come from a real MacBook Air or Pixel run (see the runbook).
 */

import {
	evaluateReleasePerformance,
	summarizeReleaseFrames
} from './MitzvahWorldReleaseProbeMetrics.js';
import { scanRuntimeSceneResources } from './RuntimeSceneResourceScan.js';

export const SURVIVAL_SIXTY_FPS_DURATION_MS = 300000;
export const SURVIVAL_SNAPSHOT_INTERVAL_MS = 30000;
export const SURVIVAL_REPORT_GLOBAL = 'AwtsmoosSurvivalSixtyFpsReport';
export const SURVIVAL_RECORDER_GLOBAL = 'AwtsmoosSurvivalSixtyFpsRecorder';
export const FRAMES_INSIDE_BUDGET_LIMIT_MS = 16.7;
export const FRAMES_INSIDE_BUDGET_MINIMUM_RATE = 0.95;
export const STABILITY_RELATIVE_TOLERANCE = 0.1;

/**
 * Absolute floors for the return-to-spawn stability comparison (a count that starts at
 * zero cannot be judged by a percentage alone). Chunks must return exactly: the survival
 * profile holds one spawn chunk, so any extra live chunk after returning is a leak.
 */
const STABILITY_ABSOLUTE_TOLERANCE = Object.freeze({
	activeChunks: 0,
	draws: 5,
	heapBytes: 10 * 1024 * 1024,
	meshes: 2,
	textures: 1,
	triangles: 500
});

const STABILITY_COUNTERS = Object.freeze([
	'draws',
	'triangles',
	'meshes',
	'activeChunks',
	'textures',
	'heapBytes'
]);

/**
 * Creates one recorder. Drive it with requestAnimationFrame through start(), or drive it
 * manually in tests with recordFrame(nowMs). It never renders and never touches the game
 * loop: it only samples timestamps and reads renderer/scene counters.
 */
export function createSurvivalFrameRecorder(options = {}) {
	const environment = options.environment || globalThis;
	const runtime = options.runtime || null;
	const durationMs = positiveOr(options.durationMs, SURVIVAL_SIXTY_FPS_DURATION_MS);
	const snapshotIntervalMs = positiveOr(options.snapshotIntervalMs, SURVIVAL_SNAPSHOT_INTERVAL_MS);
	const clock = options.clock || defaultClock(environment);
	const raf = options.requestAnimationFrame
		|| environment.requestAnimationFrame?.bind(environment)
		|| null;
	const onReport = typeof options.onReport === 'function' ? options.onReport : null;
	const state = {
		finished: false,
		frameMilliseconds: [],
		generationMaximumMilliseconds: null,
		generationSource: null,
		lastTimestampMs: null,
		marks: {},
		report: null,
		snapshots: [],
		startedAtMs: null,
		stopReason: null
	};

	const recorder = {
		finish,
		mark,
		recordFrame,
		recordGenerationSlice,
		snapshot,
		start,
		stop,
		get durationMs() { return durationMs; },
		get finished() { return state.finished; },
		get frameCount() { return state.frameMilliseconds.length; },
		get report() { return state.report; },
		get snapshots() { return [...state.snapshots]; },
		get started() { return state.startedAtMs !== null; }
	};
	return recorder;

	function start() {
		if (state.startedAtMs !== null) return false;
		state.startedAtMs = clock();
		snapshot('spawn');
		if (!raf) return false;
		const tick = nowMs => {
			if (state.finished) return;
			recordFrame(nowMs);
			if (state.finished) return;
			raf(tick);
		};
		raf(tick);
		return true;
	}

	function stop(reason = 'stopped-early') {
		if (state.finished) return state.report;
		return finish(reason);
	}

	function recordFrame(nowMs, sample = {}) {
		if (state.finished) return false;
		if (state.startedAtMs === null) state.startedAtMs = nowMs;
		if (state.lastTimestampMs !== null) {
			const interval = nowMs - state.lastTimestampMs;
			if (Number.isFinite(interval) && interval >= 0) state.frameMilliseconds.push(interval);
		}
		state.lastTimestampMs = nowMs;
		if (Number.isFinite(sample.generationMilliseconds)) {
			recordGenerationSlice(sample.generationMilliseconds, sample.generationSource || 'frame-sample');
		}
		const elapsed = nowMs - state.startedAtMs;
		const lastSnapshot = state.snapshots.at(-1);
		if (!lastSnapshot || nowMs - lastSnapshot.atMs >= snapshotIntervalMs) snapshot();
		if (elapsed >= durationMs) finish('duration-complete');
		return !state.finished;
	}

	function recordGenerationSlice(milliseconds, source = 'manual') {
		if (!Number.isFinite(milliseconds) || milliseconds < 0) return false;
		if (state.generationMaximumMilliseconds === null
			|| milliseconds > state.generationMaximumMilliseconds) {
			state.generationMaximumMilliseconds = milliseconds;
			state.generationSource = source;
		}
		return true;
	}

	function mark(label) {
		const entry = snapshot(label);
		state.marks[label] = entry;
		return entry;
	}

	function snapshot(label = null) {
		const nowMs = clock();
		const counters = extractRenderCounters(runtime, environment);
		const entry = Object.freeze({
			...counters.values,
			atMs: nowMs,
			elapsedMs: state.startedAtMs === null ? 0 : Math.max(0, nowMs - state.startedAtMs),
			label,
			sources: Object.freeze({ ...counters.sources })
		});
		state.snapshots.push(entry);
		return entry;
	}

	function finish(reason = 'finished') {
		if (state.finished) return state.report;
		state.finished = true;
		state.stopReason = reason;
		const report = buildReport(reason);
		state.report = report;
		try {
			environment[SURVIVAL_REPORT_GLOBAL] = report;
		} catch {
			// A frozen test environment must never break the report itself.
		}
		onReport?.(report);
		return report;
	}

	function buildReport(reason) {
		const frames = summarizeReleaseFrames(state.frameMilliseconds);
		const insideBudget = state.frameMilliseconds.filter(value => value <= FRAMES_INSIDE_BUDGET_LIMIT_MS).length;
		const framesInsideBudgetRate = frames.count ? insideBudget / frames.count : null;
		const generation = generationEvidence();
		const performance = evaluateReleasePerformance({
			frames,
			generationMaximumMilliseconds: generation.maximumMilliseconds ?? NaN
		});
		const failures = [...performance.failures];
		if (framesInsideBudgetRate !== null && framesInsideBudgetRate < FRAMES_INSIDE_BUDGET_MINIMUM_RATE) {
			failures.push('FRAMES_INSIDE_16_7_BELOW_95_PERCENT');
		}
		const stability = evaluateStability(state.snapshots);
		if (stability.stable === false) failures.push('RENDER_COUNTS_UNSTABLE_AFTER_RETURN');
		if (stability.stable === null) failures.push('STABILITY_UNMEASURED');
		const unmeasured = unmeasuredCounters(state.snapshots, generation);
		return Object.freeze({
			certified: failures.length === 0,
			deviceClass: options.deviceClass || null,
			durationMs,
			failures: Object.freeze(failures),
			frames: Object.freeze({
				...frames,
				framesInside16_7Milliseconds: insideBudget,
				framesInside16_7Rate: framesInsideBudgetRate
			}),
			generation: Object.freeze(generation),
			profile: options.profile ? Object.freeze({ ...options.profile }) : null,
			reason,
			render: Object.freeze({
				first: state.snapshots[0] || null,
				last: state.snapshots.at(-1) || null,
				maximumDraws: maxSnapshot('draws'),
				maximumTriangles: maxSnapshot('triangles'),
				snapshots: Object.freeze([...state.snapshots])
			}),
			stability: Object.freeze(stability),
			stoppedAtMs: clock(),
			thresholds: Object.freeze({
				...performance.thresholds,
				framesInside16_7MinimumRate: FRAMES_INSIDE_BUDGET_MINIMUM_RATE,
				framesInside16_7Milliseconds: FRAMES_INSIDE_BUDGET_LIMIT_MS,
				stabilityRelativeTolerance: STABILITY_RELATIVE_TOLERANCE
			}),
			unmeasured: Object.freeze(unmeasured)
		});
	}

	function generationEvidence() {
		const chunkSlice = chunkGenerationSlice();
		const maximumMilliseconds = maxFinite(
			state.generationMaximumMilliseconds,
			chunkSlice.maximumMilliseconds
		);
		const source = maximumMilliseconds === null
			? 'unavailable: no generation/upload slice source on this runtime'
			: (state.generationMaximumMilliseconds !== null
				&& state.generationMaximumMilliseconds >= (chunkSlice.maximumMilliseconds ?? -Infinity)
				? state.generationSource
				: chunkSlice.source);
		return {
			maximumMilliseconds,
			source,
			supported: maximumMilliseconds !== null
		};
	}

	function chunkGenerationSlice() {
		const diagnostics = chunkDiagnostics();
		const longest = diagnostics?.lastProcess?.longestTaskMilliseconds;
		if (!Number.isFinite(longest)) {
			return { maximumMilliseconds: null, source: 'unavailable: chunk runtime has no lastProcess.longestTaskMilliseconds' };
		}
		return { maximumMilliseconds: longest, source: 'chunkRuntime.diagnostics().lastProcess.longestTaskMilliseconds' };
	}

	function chunkDiagnostics() {
		try {
			return runtime?.chunkRuntime?.diagnostics?.() || null;
		} catch {
			return null;
		}
	}

	function maxSnapshot(field) {
		const values = state.snapshots.map(entry => entry[field]).filter(Number.isFinite);
		return values.length ? Math.max(...values) : null;
	}
}

/**
 * Reads every render-object counter the live runtime can honestly source.
 * Each value carries its source; anything the custom renderer does not expose is null
 * with a plain 'unavailable' source — never a zero, never an invention.
 */
export function extractRenderCounters(runtime = null, environment = globalThis) {
	const renderer = runtime?.renderer || {};
	const stats = renderer.stats || renderer.info?.render || {};
	const memory = renderer.info?.memory || {};
	const diagnostics = chunkDiagnosticsOf(runtime);
	const scene = runtime?.scene || null;
	const sceneScan = scene ? trySceneScan(scene) : null;
	const heap = heapEvidence(environment);
	const values = {
		activeChunks: chunkCount(diagnostics, runtime),
		draws: finiteOrNull(stats.draws ?? stats.calls),
		geometries: finiteOrNull(memory.geometries),
		heapBytes: heap.usedBytes,
		meshes: sceneScan ? sceneScan.objectCount : null,
		textures: sceneScan ? sceneScan.textureCount : finiteOrNull(memory.textures),
		triangles: finiteOrNull(stats.triangles) || (sceneScan ? sceneScan.triangles : null),
		uploadsDeferred: finiteOrNull(diagnostics?.queue?.stats?.uploadsDeferred),
		uploadsPending: finiteOrNull(diagnostics?.queue?.pending)
	};
	const sources = {
		activeChunks: chunkCountSource(diagnostics, runtime),
		draws: stats.draws !== undefined
			? 'renderer.stats.draws'
			: (stats.calls !== undefined ? 'renderer.info.render.calls' : 'unavailable: renderer exposes no draw-call counter'),
		geometries: memory.geometries !== undefined
			? 'renderer.info.memory.geometries'
			: 'unavailable: renderer exposes no geometry count',
		heapBytes: heap.source,
		meshes: sceneScan
			? 'scene scan objectCount (RuntimeSceneResourceScan)'
			: (scene ? 'unavailable: scene scan failed' : 'unavailable: no scene on runtime'),
		textures: sceneScan
			? 'scene scan textureCount (RuntimeSceneResourceScan)'
			: (memory.textures !== undefined ? 'renderer.info.memory.textures' : 'unavailable: no texture counter'),
		triangles: stats.triangles !== undefined
			? 'renderer.stats.triangles'
			: (sceneScan ? 'scene scan triangles (RuntimeSceneResourceScan)' : 'unavailable: renderer exposes no triangle counter'),
		uploadsDeferred: diagnostics?.queue?.stats?.uploadsDeferred !== undefined
			? 'chunkRuntime.diagnostics().queue.stats.uploadsDeferred'
			: 'unavailable: no chunk upload queue on this runtime (the custom renderer exposes no per-frame GPU upload counter)',
		uploadsPending: diagnostics?.queue?.pending !== undefined
			? 'chunkRuntime.diagnostics().queue.pending'
			: 'unavailable: no chunk upload queue on this runtime'
	};
	return { sources, values };
}

/**
 * Compares the first snapshot (spawn, settled) with the last snapshot (back at spawn
 * after travelling away) and judges whether render-object counts and heap stabilized.
 * Returns stable null with named unmeasured counters when either side cannot source a
 * counter — stability is unproven, not passed, in that case.
 */
export function evaluateStability(snapshots = []) {
	const first = snapshots[0] || null;
	const last = snapshots.at(-1) || null;
	if (!first || !last || first === last) {
		return { compared: {}, failures: ['STABILITY_NEEDS_TWO_SNAPSHOTS'], stable: null, unmeasured: [...STABILITY_COUNTERS] };
	}
	const compared = {};
	const failures = [];
	const unmeasured = [];
	for (const counter of STABILITY_COUNTERS) {
		const before = first[counter];
		const after = last[counter];
		if (!Number.isFinite(before) || !Number.isFinite(after)) {
			compared[counter] = { after, before, status: 'unmeasured' };
			unmeasured.push(counter);
			continue;
		}
		const tolerance = Math.max(
			Math.abs(before) * STABILITY_RELATIVE_TOLERANCE,
			STABILITY_ABSOLUTE_TOLERANCE[counter]
		);
		const within = Math.abs(after - before) <= tolerance;
		compared[counter] = { after, before, status: within ? 'stable' : 'unstable', tolerance };
		if (!within) failures.push(`STABILITY_${counter.toUpperCase()}_DRIFTED:${before}->${after}`);
	}
	return {
		compared: Object.freeze(compared),
		failures: Object.freeze(failures),
		stable: unmeasured.length ? null : failures.length === 0,
		unmeasured: Object.freeze(unmeasured)
	};
}

/** Renders the short numbers-only block the owner pastes back from a real-hardware run. */
export function copyableSurvivalSummary(report) {
	if (!report) return 'No survival report yet — run the 5-minute test first.';
	const frames = report.frames || {};
	const render = report.render || {};
	const first = render.first || {};
	const last = render.last || {};
	const percent = value => value === null || value === undefined ? 'n/a' : `${(value * 100).toFixed(1)}%`;
	const ms = value => value === null || value === undefined ? 'n/a' : `${value} ms`;
	const count = value => value === null || value === undefined ? 'n/a' : String(value);
	return [
		'SURVIVAL 60 FPS — 5-minute run',
		`device class: ${report.deviceClass || 'n/a'} / maxDpr: ${report.profile?.maxDpr ?? 'n/a'}`,
		`frames: ${count(frames.count)} | p50: ${ms(frames.p50Milliseconds)} | p95: ${ms(frames.p95Milliseconds)} | worst: ${ms(frames.worstMilliseconds)}`,
		`inside 16.7ms: ${percent(frames.framesInside16_7Rate)} | over 33.3ms: ${count(frames.framesOver33_3Milliseconds)} (${percent(frames.longFrameRate)}) | over 50ms: ${count(frames.framesOver50Milliseconds)}`,
		`generation/upload slice max: ${ms(report.generation?.maximumMilliseconds)} (${report.generation?.source || 'n/a'})`,
		`draws: ${count(first.draws)} -> ${count(last.draws)} | triangles: ${count(first.triangles)} -> ${count(last.triangles)} | meshes: ${count(first.meshes)} -> ${count(last.meshes)} | chunks: ${count(first.activeChunks)} -> ${count(last.activeChunks)} | textures: ${count(first.textures)} -> ${count(last.textures)} | heap: ${count(first.heapBytes)} -> ${count(last.heapBytes)}`,
		`stable after return: ${report.stability?.stable === true ? 'YES' : report.stability?.stable === false ? 'NO' : 'UNMEASURED'}`,
		`CERTIFIED: ${report.certified ? 'YES' : 'NO'}${report.failures?.length ? ` — failures: ${report.failures.join(', ')}` : ''}`,
		`unmeasured: ${report.unmeasured?.length ? report.unmeasured.join('; ') : 'none'}`
	].join('\n');
}

function chunkDiagnosticsOf(runtime) {
	try {
		return runtime?.chunkRuntime?.diagnostics?.() || null;
	} catch {
		return null;
	}
}

function chunkCount(diagnostics, runtime) {
	if (Number.isFinite(diagnostics?.count)) return diagnostics.count;
	if (Number.isFinite(diagnostics?.active)) return diagnostics.active;
	if (Array.isArray(diagnostics?.records)) return diagnostics.records.length;
	if (Number.isFinite(runtime?.chunkRuntime?.registry?.size)) return runtime.chunkRuntime.registry.size;
	return null;
}

function chunkCountSource(diagnostics, runtime) {
	if (Number.isFinite(diagnostics?.count)) return 'chunkRuntime.diagnostics().count';
	if (Number.isFinite(diagnostics?.active)) return 'chunkRuntime.diagnostics().active';
	if (Array.isArray(diagnostics?.records)) return 'chunkRuntime.diagnostics().records.length';
	if (Number.isFinite(runtime?.chunkRuntime?.registry?.size)) return 'chunkRuntime.registry.size';
	return 'unavailable: no chunk registry on this runtime (survival holds one spawn chunk by profile, not by a live registry read)';
}

function heapEvidence(environment) {
	const memory = environment?.performance?.memory
		|| globalThis.performance?.memory
		|| null;
	if (!memory || !Number.isFinite(memory.usedJSHeapSize)) {
		return {
			source: 'unavailable: performance.memory is absent (Chrome-only; Safari/Firefox expose no JS heap size)',
			usedBytes: null
		};
	}
	return { source: 'performance.memory.usedJSHeapSize', usedBytes: memory.usedJSHeapSize };
}

function trySceneScan(scene) {
	try {
		return scanRuntimeSceneResources(scene);
	} catch {
		return null;
	}
}

function unmeasuredCounters(snapshots, generation) {
	const missing = [];
	const last = snapshots.at(-1);
	if (!last) return ['no snapshots taken'];
	for (const counter of STABILITY_COUNTERS) {
		if (!Number.isFinite(last[counter])) missing.push(`${counter}: ${last.sources?.[counter] || 'unavailable'}`);
	}
	if (!generation.supported) missing.push(`generationMaximumMilliseconds: ${generation.source}`);
	return missing;
}

function maxFinite(...values) {
	const finite = values.filter(Number.isFinite);
	return finite.length ? Math.max(...finite) : null;
}

function finiteOrNull(value) {
	return Number.isFinite(value) ? Number(value) : null;
}

function positiveOr(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

function defaultClock(environment) {
	return () => environment?.performance?.now?.() ?? Date.now();
}
