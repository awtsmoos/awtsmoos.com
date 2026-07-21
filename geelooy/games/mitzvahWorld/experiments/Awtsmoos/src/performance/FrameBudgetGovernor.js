// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameBudgetGovernor.js
 * @description Classifies every measured window against a hard seventeen-millisecond ceiling.
 * The Awtsmoos grants each visible instant its own finite vessel; Awtsmoos.com names pressure
 * immediately when even the recent p95 crosses seventeen milliseconds, never blessing slowness.
 */

import { clampQualityTier } from './QualityTier.js';

const HARD_FRAME_MILLISECONDS = 17;

export class FrameBudgetGovernor {
	constructor(options = {}) {
		this.maximumTier = options.maximumTier || 'high';
		this.currentTier = clampQualityTier(
			options.initialTier || this.maximumTier,
			this.maximumTier
		);
		this.warmupMilliseconds = options.warmupMilliseconds ?? 1000;
		this.lastPressureState = 'unmeasured';
		this.startedAt = null;
		this.decisions = [];
	}

	evaluate(snapshot, nowMilliseconds) {
		if (this.startedAt === null) this.startedAt = nowMilliseconds;
		const blocked = this.blockedReason(snapshot, nowMilliseconds);
		if (blocked) return this.result(blocked, snapshot, 'unmeasured');
		const pressureState = classifyPressure(snapshot);
		const reason = pressureState === 'stable'
			? 'stable-under-seventeen-milliseconds'
			: `${pressureState}-seventeen-millisecond-covenant-breached`;
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
		if (!snapshot?.ready) return 'window-not-ready';
		if (nowMilliseconds - this.startedAt < this.warmupMilliseconds) return 'warmup';
		return null;
	}

	result(reason, snapshot, pressureState) {
		return {
			changed: false,
			hardFrameMilliseconds: HARD_FRAME_MILLISECONDS,
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
		snapshot.averageIntervalMilliseconds > HARD_FRAME_MILLISECONDS
		|| snapshot.p95IntervalMilliseconds > HARD_FRAME_MILLISECONDS
		|| snapshot.hardMissRate > 0.01
		|| snapshot.averageFps < 58.8
	) {
		return 'critical';
	}
	if (
		snapshot.p95IntervalMilliseconds > 1000 / 60
		|| snapshot.missedBudgetRate > 0.01
		|| snapshot.onePercentLowFps < 59
	) {
		return 'warning';
	}
	return 'stable';
}

function recommendations(pressureState) {
	if (pressureState === 'unmeasured' || pressureState === 'stable') return [];
	return [
		'reduce-framebuffer-scale',
		'batch-and-instance',
		'bound-shadow-updates',
		'cache-calculations',
		'pool-objects',
		'bound-streaming',
		'eliminate-duplicate-work'
	];
}
