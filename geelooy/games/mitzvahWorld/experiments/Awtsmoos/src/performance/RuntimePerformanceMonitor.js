// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceMonitor.js
 * @description Measures sustained 60 FPS evidence while preserving the selected visual quality.
 * RESPONSIBILITY: aggregate frame/CPU windows, classify pressure, sample resources, and publish.
 * NON-RESPONSIBILITY: this monitor never lowers resolution, distance, density, or effects.
 * ARCHITECTURE: Hod measures, Gevurah diagnoses pressure, and Chesed protects complete quality.
 * OROS AND KEILIM: living gameplay is ohr; windows, resources, and pressure receipts are keilim.
 * The Awtsmoos creates each frame and its witness; Awtsmoos.com claims stability only when
 * average, 1% low, 0.1% low, and measured costs agree.
 */

import { FrameBudgetGovernor } from './FrameBudgetGovernor.js';
import { FrameBudgetWindow } from './FrameBudgetWindow.js';
import {
	createRuntimePerformanceProbe,
	publishRuntimePerformanceProbe
} from './RuntimePerformanceProbe.js';
import { RuntimeResourceSnapshot } from './RuntimeResourceSnapshot.js';

const EVALUATION_INTERVAL_MS = 500;

export class RuntimePerformanceMonitor {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		const capacity = options.capacity || 600;
		this.frameWindow = new FrameBudgetWindow({ capacity });
		this.cpuWindow = new FrameBudgetWindow({ capacity });
		this.governor = new FrameBudgetGovernor({
			initialTier: runtime.qualityProfile.quality,
			maximumTier: runtime.qualityProfile.quality,
			warmupMilliseconds: options.warmupMilliseconds ?? 8000
		});
		this.resourceSampler = new RuntimeResourceSnapshot();
		this.frame = this.frameWindow.snapshot();
		this.cpu = this.cpuWindow.snapshot();
		this.resources = this.resourceSampler.collect(runtime);
		this.decision = this.governor.evaluate(this.frame, 0);
		this.lastEvaluationAt = 0;
		this.element = createRuntimePerformanceProbe();
		runtime.adaptiveQualityTier = runtime.qualityProfile.quality;
		runtime.adaptiveRenderScale = 1;
	}

	record(intervalMilliseconds, nowMilliseconds, costs = {}) {
		if (typeof document !== 'undefined' && document.hidden) {
			this.frameWindow.clear();
			this.cpuWindow.clear();
			return this.frame;
		}
		this.frameWindow.push(intervalMilliseconds);
		this.cpuWindow.push(costs.cpuFrameMilliseconds);
		if (nowMilliseconds - this.lastEvaluationAt < EVALUATION_INTERVAL_MS) {
			return this.frame;
		}
		this.lastEvaluationAt = nowMilliseconds;
		this.frame = this.frameWindow.snapshot();
		this.cpu = this.cpuWindow.snapshot();
		this.decision = this.governor.evaluate(this.frame, nowMilliseconds);
		this.resources = this.resourceSampler.collect(this.runtime, costs, nowMilliseconds);
		publishRuntimePerformanceProbe(this.element, this.diagnostics());
		return this.frame;
	}

	diagnostics() {
		return {
			cpu: { ...this.cpu },
			frame: { ...this.frame },
			governor: {
				currentTier: this.governor.currentTier,
				decisions: [...this.governor.decisions],
				pressureState: this.decision.pressureState,
				qualityPreserved: true,
				recommendations: [...this.decision.recommendations]
			},
			meets60Target: meets60Target(this.frame),
			resources: this.resources,
			targetFps: 60
		};
	}
}

function meets60Target(frame) {
	return frame.ready
		&& frame.averageFps >= 59
		&& frame.onePercentLowFps >= 55
		&& frame.zeroPointOnePercentLowFps >= 50;
}

export function installRuntimePerformanceMonitor(runtime, options) {
	const monitor = new RuntimePerformanceMonitor(runtime, options);
	runtime.performanceMonitor = monitor;
	return monitor;
}
