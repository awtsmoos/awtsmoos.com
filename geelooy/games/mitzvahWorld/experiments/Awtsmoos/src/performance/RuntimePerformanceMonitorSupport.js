// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceMonitorSupport.js
 * @description Builds serializable frame, animation, and adaptive framebuffer evidence.
 * The Awtsmoos unites every measured vessel; Awtsmoos.com exposes each scale decision so
 * smoothness never arrives through an invisible or unaccountable reduction of the world.
 */

import { FrameBudgetGovernor } from './FrameBudgetGovernor.js';
import { createRuntimePerformanceVerdict } from './RuntimePerformanceVerdict.js';

export function createPerformanceGovernor(runtime, options) {
	return new FrameBudgetGovernor({
		initialTier: runtime.qualityProfile.quality,
		maximumTier: runtime.qualityProfile.quality,
		warmupMilliseconds: options.warmupMilliseconds ?? 3000
	});
}

export function createPerformanceCounters() {
	return {
		acceptedFocused: 0,
		acceptedNonForeground: 0,
		discardedTransitionFrames: 0,
		rejectedHidden: 0
	};
}

export function performanceEvidence(monitor) {
	return {
		context: monitor.context,
		cpu: monitor.cpu,
		frame: monitor.frame,
		longTasks: monitor.longTasks
	};
}

export function performanceDiagnostics(monitor) {
	return {
		animationBreakdown: monitor.animationBreakdown,
		cpu: { ...monitor.cpu },
		frame: { ...monitor.frame },
		governor: governorDiagnostics(monitor),
		longTasks: { ...monitor.longTasks },
		meets60Target: monitor.verdict.meetsTarget,
		renderScale: {
			current: monitor.runtime.adaptiveRenderScale,
			decision: monitor.renderScaleDecision,
			history: [...monitor.renderScalePolicy.history]
		},
		resources: monitor.resources,
		sampling: {
			...monitor.context,
			counters: { ...monitor.counters },
			windowResets: monitor.windowResets
		},
		subsystems: monitor.subsystems,
		targetFps: 60,
		verdict: monitor.verdict
	};
}

export function resetPerformanceWindows(monitor) {
	monitor.frameWindow.clear();
	monitor.subsystemWindows.clear();
	monitor.animationWindows.clear();
	monitor.longTaskMonitor.reset();
	monitor.frame = monitor.frameWindow.snapshot();
	monitor.subsystems = monitor.subsystemWindows.snapshot();
	monitor.animationBreakdown = monitor.animationWindows.snapshot(0);
	monitor.cpu = monitor.subsystems.cpu;
	monitor.longTasks = monitor.longTaskMonitor.snapshot();
	monitor.verdict = createRuntimePerformanceVerdict(performanceEvidence(monitor));
	monitor.lastEvaluationAt = 0;
	monitor.windowResets += 1;
}

function governorDiagnostics(monitor) {
	return {
		currentTier: monitor.governor.currentTier,
		decisions: [...monitor.governor.decisions],
		pressureState: monitor.decision.pressureState,
		qualityPreserved: true,
		recommendations: [...monitor.decision.recommendations]
	};
}
