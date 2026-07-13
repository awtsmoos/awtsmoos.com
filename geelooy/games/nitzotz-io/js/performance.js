// B"H
// Boruch Hashem
// Blessed is He
const SAMPLE_CAPACITY = 90;
const DECISION_INTERVAL = 30;

/**
 * The Awtsmoos grants each frame a new breath. This governor measures a rolling
 * congregation of breaths, surrendering ornament before motion loses clarity.
 */
export function createPerformanceState() {
	return {
		fps: 60,
		ms: 16.7,
		p95: 16.7,
		p99: 16.7,
		scale: 1,
		resolutionScale: 1,
		stress: 0,
		commands: 0,
		postfx: true,
		mapEvery: 4,
		frame: 0,
		samples: new Float32Array(SAMPLE_CAPACITY),
		sampleIndex: 0,
		sampleSize: 0
	};
}

/** Update frame evidence and change quality only through stable hysteresis. */
export function updatePerformance(performanceState, dt, commands = performanceState.commands) {
	const frameMs = clamp(dt * 1000, 1, 100);
	performanceState.ms = mix(performanceState.ms || frameMs, frameMs, 0.08);
	performanceState.fps = mix(performanceState.fps || 60, 1000 / frameMs, 0.08);
	performanceState.commands = commands;
	recordSample(performanceState, frameMs);
	if (performanceState.frame % DECISION_INTERVAL !== 0) return;
	measurePercentiles(performanceState);
	applyQualityDecision(performanceState);
}

/** Expose the current rendering fraction without coupling callers to telemetry. */
export function quality(world) {
	return world.performance?.scale ?? 1;
}

function recordSample(performanceState, frameMs) {
	performanceState.samples[performanceState.sampleIndex] = frameMs;
	performanceState.sampleIndex = (performanceState.sampleIndex + 1) % SAMPLE_CAPACITY;
	performanceState.sampleSize = Math.min(SAMPLE_CAPACITY, performanceState.sampleSize + 1);
}

function measurePercentiles(performanceState) {
	if (performanceState.sampleSize < 12) return;
	const ordered = Array.from(
		performanceState.samples.subarray(0, performanceState.sampleSize)
	).sort((left, right) => left - right);
	performanceState.p95 = percentile(ordered, 0.95);
	performanceState.p99 = percentile(ordered, 0.99);
}

function applyQualityDecision(performanceState) {
	const frameStress = clamp((performanceState.p95 - 16.8) / 18, 0, 1);
	const drawStress = clamp((performanceState.commands - 260) / 360, 0, 1);
	const targetStress = Math.max(frameStress, drawStress);
	const response = targetStress > performanceState.stress ? 0.34 : 0.065;
	performanceState.stress = clamp(
		mix(performanceState.stress, targetStress, response),
		0,
		1
	);
	performanceState.scale = clamp(1 - performanceState.stress * 0.66, 0.38, 1);
	performanceState.resolutionScale = resolutionScaleFor(performanceState.stress);
	if (performanceState.stress > 0.34) performanceState.postfx = false;
	if (performanceState.stress < 0.16) performanceState.postfx = true;
	performanceState.mapEvery = performanceState.stress > 0.62 ? 10 : performanceState.stress > 0.3 ? 6 : 4;
}

function resolutionScaleFor(stress) {
	if (stress > 0.72) return 0.7;
	if (stress > 0.46) return 0.8;
	if (stress > 0.24) return 0.9;
	return 1;
}

function percentile(ordered, ratio) {
	const index = Math.min(ordered.length - 1, Math.floor(ordered.length * ratio));
	return ordered[index];
}

function mix(left, right, amount) {
	return left + (right - left) * amount;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
