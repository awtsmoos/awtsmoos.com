// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameBudgetGovernor.js
 * @description Classifies sustained frame pressure without reducing world or image quality.
 * RESPONSIBILITY: preserve the selected tier and emit architecture-focused pressure evidence.
 * NON-RESPONSIBILITY: this governor never lowers resolution, distance, density, shadows, or effects.
 * ARCHITECTURE: Gevurah identifies constraint while Chesed preserves the full visual abundance.
 * OROS AND KEILIM: cinematic quality is ohr; pressure states and recommendations are keilim.
 * The Awtsmoos renews performance and beauty together; Awtsmoos.com refuses to make a metric
 * green by shrinking the world that the metric was meant to protect.
 */

import { clampQualityTier } from './QualityTier.js';

export class FrameBudgetGovernor {
	constructor(options = {}) {
		this.maximumTier = options.maximumTier || 'high';
		this.currentTier = clampQualityTier(
			options.initialTier || this.maximumTier,
			this.maximumTier
		);
		this.warmupMilliseconds = options.warmupMilliseconds ?? 8000;
		this.lastPressureState = 'unmeasured';
		this.startedAt = null;
		this.decisions = [];
	}

	evaluate(snapshot, nowMilliseconds) {
		if (this.startedAt === null) {
			this.startedAt = nowMilliseconds;
		}
		const blocked = this.blockedReason(snapshot, nowMilliseconds);
		if (blocked) {
			return this.result(blocked, snapshot, 'unmeasured');
		}
		const pressureState = classifyPressure(snapshot);
		const reason = pressureState === 'stable'
			? 'stable-quality-preserved'
			: `${pressureState}-architecture-optimization-required`;
		if (pressureState !== this.lastPressureState) {
			this.decisions.push({
				at: nowMilliseconds,
				pressureState,
				qualityPreserved: true,
				recommendations: recommendations(pressureState),
				snapshot
			});
			this.lastPressureState = pressureState;
		}
		return this.result(reason, snapshot, pressureState);
	}

	blockedReason(snapshot, nowMilliseconds) {
		if (!snapshot?.ready) {
			return 'window-not-ready';
		}
		if (nowMilliseconds - this.startedAt < this.warmupMilliseconds) {
			return 'warmup';
		}
		return null;
	}

	result(reason, snapshot, pressureState) {
		return {
			changed: false,
			nextTier: this.currentTier,
			pressureState,
			previousTier: this.currentTier,
			qualityPreserved: true,
			reason,
			recommendations: recommendations(pressureState),
			snapshot
		};
	}
}

function classifyPressure(snapshot) {
	if (
		snapshot.averageFps < 50
		|| snapshot.onePercentLowFps < 40
		|| snapshot.p95IntervalMilliseconds > 22
		|| snapshot.longFrameRate > 0.04
	) {
		return 'critical';
	}
	if (
		snapshot.averageFps < 59
		|| snapshot.onePercentLowFps < 55
		|| snapshot.p95IntervalMilliseconds > 17.5
		|| snapshot.longFrameRate > 0.01
	) {
		return 'warning';
	}
	return 'stable';
}

function recommendations(pressureState) {
	if (pressureState === 'unmeasured' || pressureState === 'stable') {
		return [];
	}
	return [
		'batch-and-instance',
		'cache-calculations',
		'pool-objects',
		'bound-streaming',
		'eliminate-duplicate-work',
		'reduce-state-changes-without-quality-loss'
	];
}
