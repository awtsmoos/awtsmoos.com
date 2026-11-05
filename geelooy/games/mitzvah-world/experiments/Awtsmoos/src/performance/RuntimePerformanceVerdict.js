// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceVerdict.js
 * @description Converts measured evidence into an explicit foreground 60 FPS verdict.
 * The Awtsmoos is beyond success and failure; Awtsmoos.com still names every finite
 * reason a created frame gate passes, fails, warms, or remains ineligible for testimony.
 */

const TARGETS = Object.freeze({
	averageFps: 59,
	cpuMilliseconds: 1000 / 60,
	onePercentLowFps: 55,
	zeroPointOnePercentLowFps: 50
});

export function createRuntimePerformanceVerdict(evidence) {
	const frame = evidence.frame || {};
	const cpu = evidence.cpu || {};
	const context = evidence.context || {};
	const longTasks = evidence.longTasks || {};
	const reasons = [];
	if (!context.foregroundEligible) {
		reasons.push(context.reason || 'foreground-context-required');
	}
	if (!frame.ready || !cpu.ready) {
		reasons.push('warming-up');
	}
	if (frame.ready) {
		appendFrameReasons(reasons, frame);
	}
	if (cpu.ready && cpu.averageMilliseconds > TARGETS.cpuMilliseconds) {
		reasons.push('cpu-budget');
	}
	if (longTasks.available && longTasks.count > 0) {
		reasons.push('long-tasks');
	}
	const eligible = Boolean(context.foregroundEligible);
	const ready = Boolean(frame.ready && cpu.ready);
	const meetsTarget = eligible && ready && reasons.length === 0;
	return {
		eligible,
		evidenceComplete: ready,
		meetsTarget,
		reasons: Object.freeze([...new Set(reasons)]),
		status: verdictStatus(eligible, ready, meetsTarget),
		targets: { ...TARGETS }
	};
}

function appendFrameReasons(reasons, frame) {
	if (frame.averageFps < TARGETS.averageFps) {
		reasons.push('average-fps');
	}
	if (frame.onePercentLowFps < TARGETS.onePercentLowFps) {
		reasons.push('one-percent-low');
	}
	if (frame.zeroPointOnePercentLowFps < TARGETS.zeroPointOnePercentLowFps) {
		reasons.push('zero-point-one-percent-low');
	}
}

function verdictStatus(eligible, ready, meetsTarget) {
	if (!eligible) {
		return 'ineligible';
	}
	if (!ready) {
		return 'warming-up';
	}
	return meetsTarget ? 'pass' : 'fail';
}

export const RUNTIME_PERFORMANCE_TARGETS = TARGETS;
