// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceMonitor.js
 * @description Coordinates frame evidence and enforces a measured sixty-frame render vessel.
 * The Awtsmoos renews visible abundance and motion together; Awtsmoos.com preserves geometry
 * while a bounded framebuffer scale yields only when real foreground pressure requires it.
 */

import { AdaptiveRenderScalePolicy } from './AdaptiveRenderScalePolicy.js';
import { FrameBudgetWindow } from './FrameBudgetWindow.js';
import { RuntimeAnimationWindows } from './RuntimeAnimationWindows.js';
import { RuntimeLongTaskMonitor } from './RuntimeLongTaskMonitor.js';
import { createRuntimePerformanceVerdict } from './RuntimePerformanceVerdict.js';
import {
	createRuntimePerformanceProbe,
	publishRuntimePerformanceProbe
} from './RuntimePerformanceProbe.js';
import {
	createPerformanceCounters,
	createPerformanceGovernor,
	performanceDiagnostics,
	performanceEvidence,
	resetPerformanceWindows
} from './RuntimePerformanceMonitorSupport.js';
import { RuntimeResourceSnapshot } from './RuntimeResourceSnapshot.js';
import { RuntimeSamplingContext } from './RuntimeSamplingContext.js';
import { RuntimeSubsystemWindows } from './RuntimeSubsystemWindows.js';

const EVALUATION_INTERVAL_MS = 500;

export class RuntimePerformanceMonitor {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		const capacity = options.capacity || 600;
		this.frameWindow = new FrameBudgetWindow({ capacity });
		this.subsystemWindows = new RuntimeSubsystemWindows({ capacity });
		this.animationWindows = new RuntimeAnimationWindows({ capacity });
		this.samplingContext = new RuntimeSamplingContext(options.contextProvider);
		this.longTaskMonitor = new RuntimeLongTaskMonitor(options.PerformanceObserver);
		this.governor = createPerformanceGovernor(runtime, options);
		this.resourceSampler = new RuntimeResourceSnapshot();
		this.renderScalePolicy = new AdaptiveRenderScalePolicy(runtime, options.renderScale);
		this.frame = this.frameWindow.snapshot();
		this.subsystems = this.subsystemWindows.snapshot();
		this.animationBreakdown = this.animationWindows.snapshot(0);
		this.cpu = this.subsystems.cpu;
		this.context = this.samplingContext.sample();
		this.longTasks = this.longTaskMonitor.snapshot();
		this.resources = this.resourceSampler.collect(runtime);
		this.decision = this.governor.evaluate(this.frame, 0);
		this.renderScaleDecision = this.renderScalePolicy.result(false, 'unmeasured', 'initial');
		this.verdict = createRuntimePerformanceVerdict(performanceEvidence(this));
		this.counters = createPerformanceCounters();
		this.lastEvaluationAt = 0;
		this.windowResets = 0;
		this.element = createRuntimePerformanceProbe();
		runtime.adaptiveQualityTier = runtime.qualityProfile.quality;
	}

	record(intervalMilliseconds, nowMilliseconds, costs = {}) {
		this.context = this.samplingContext.sample();
		if (this.context.changed) return this.discardTransitionFrame();
		if (!this.context.recordable) {
			this.counters.rejectedHidden += 1;
			return this.frame;
		}
		this.countAcceptedContext();
		this.frameWindow.push(intervalMilliseconds);
		this.subsystemWindows.push(costs);
		this.animationWindows.push(costs.animationBreakdown);
		if (nowMilliseconds - this.lastEvaluationAt >= EVALUATION_INTERVAL_MS) {
			this.evaluate(costs, nowMilliseconds);
		}
		return this.frame;
	}

	evaluate(costs, nowMilliseconds) {
		this.lastEvaluationAt = nowMilliseconds;
		this.frame = this.frameWindow.snapshot();
		this.subsystems = this.subsystemWindows.snapshot();
		this.animationBreakdown = this.animationWindows.snapshot(
			this.subsystems.animation.averageMilliseconds
		);
		this.cpu = this.subsystems.cpu;
		this.decision = this.governor.evaluate(this.frame, nowMilliseconds);
		this.renderScaleDecision = this.renderScalePolicy.evaluate(
			this.decision.pressureState,
			nowMilliseconds
		);
		this.resources = this.resourceSampler.collect(this.runtime, costs, nowMilliseconds);
		this.longTasks = this.longTaskMonitor.snapshot();
		this.verdict = createRuntimePerformanceVerdict(performanceEvidence(this));
		publishRuntimePerformanceProbe(this.element, this.diagnostics());
	}

	diagnostics() {
		return performanceDiagnostics(this);
	}

	dispose() {
		this.longTaskMonitor.dispose();
		this.element?.remove?.();
	}

	discardTransitionFrame() {
		resetPerformanceWindows(this);
		this.counters.discardedTransitionFrames += 1;
		if (!this.context.recordable) this.counters.rejectedHidden += 1;
		return this.frame;
	}

	countAcceptedContext() {
		const key = this.context.foregroundEligible
			? 'acceptedFocused'
			: 'acceptedNonForeground';
		this.counters[key] += 1;
	}
}

export function installRuntimePerformanceMonitor(runtime, options) {
	const monitor = new RuntimePerformanceMonitor(runtime, options);
	runtime.performanceMonitor = monitor;
	return monitor;
}
