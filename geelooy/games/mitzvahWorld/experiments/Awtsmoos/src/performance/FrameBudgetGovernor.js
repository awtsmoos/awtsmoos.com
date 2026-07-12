// B"H
import {
	clampQualityTier,
	nextHigherQualityTier,
	nextLowerQualityTier,
	qualityTier
} from './QualityTier.js';

/**
 * Changes quality only after sustained evidence. One bad frame cannot exile a
 * garden, and one quiet frame cannot summon every flower back at once.
 */
export class FrameBudgetGovernor {
	constructor({
		initialTier = 'high',
		maximumTier = 'high',
		warmupMilliseconds = 8000,
		cooldownMilliseconds = 6000,
		badWindowsRequired = 2,
		goodWindowsRequired = 8
	} = {}) {
		this.maximumTier = maximumTier;
		this.currentTier = clampQualityTier(initialTier, maximumTier);
		this.warmupMilliseconds = warmupMilliseconds;
		this.cooldownMilliseconds = cooldownMilliseconds;
		this.badWindowsRequired = badWindowsRequired;
		this.goodWindowsRequired = goodWindowsRequired;
		this.startedAt = null;
		this.lastDecisionAt = -Infinity;
		this.badWindows = 0;
		this.goodWindows = 0;
		this.decisions = [];
	}

	evaluate(snapshot, nowMilliseconds) {
		if (this.startedAt === null) this.startedAt = nowMilliseconds;
		const blockedReason = this.blockedReason(snapshot, nowMilliseconds);
		if (blockedReason) return this.noChange(blockedReason, snapshot);
		if (shouldReduce(snapshot, this.currentTier)) {
			this.badWindows += 1;
			this.goodWindows = 0;
			if (this.badWindows >= this.badWindowsRequired) {
				return this.changeTier(
					nextLowerQualityTier(this.currentTier),
					'performance-pressure',
					snapshot,
					nowMilliseconds
				);
			}
			return this.noChange('collecting-pressure-evidence', snapshot);
		}
		if (shouldIncrease(snapshot)) {
			this.goodWindows += 1;
			this.badWindows = 0;
			if (this.goodWindows >= this.goodWindowsRequired) {
				return this.changeTier(
					nextHigherQualityTier(this.currentTier, this.maximumTier),
					'sustained-headroom',
					snapshot,
					nowMilliseconds
				);
			}
			return this.noChange('collecting-headroom-evidence', snapshot);
		}
		this.badWindows = 0;
		this.goodWindows = 0;
		return this.noChange('stable', snapshot);
	}

	blockedReason(snapshot, nowMilliseconds) {
		if (!snapshot?.ready) return 'window-not-ready';
		if (nowMilliseconds - this.startedAt < this.warmupMilliseconds) return 'warmup';
		if (nowMilliseconds - this.lastDecisionAt < this.cooldownMilliseconds) return 'cooldown';
		return null;
	}

	changeTier(nextTier, reason, snapshot, nowMilliseconds) {
		this.badWindows = 0;
		this.goodWindows = 0;
		if (nextTier === this.currentTier) return this.noChange('tier-boundary', snapshot);
		const previousTier = this.currentTier;
		this.currentTier = nextTier;
		this.lastDecisionAt = nowMilliseconds;
		const decision = {
			changed: true,
			previousTier,
			nextTier,
			reason,
			at: nowMilliseconds,
			snapshot
		};
		this.decisions.push(decision);
		return decision;
	}

	noChange(reason, snapshot) {
		return {
			changed: false,
			previousTier: this.currentTier,
			nextTier: this.currentTier,
			reason,
			snapshot
		};
	}
}

function shouldReduce(snapshot, tierName) {
	const tier = qualityTier(tierName);
	return snapshot.p95IntervalMilliseconds > 22
		|| snapshot.averageFps < 50
		|| snapshot.longFrameRate > tier.maximumLongFrameRate;
}

function shouldIncrease(snapshot) {
	return snapshot.p95IntervalMilliseconds <= 17.5
		&& snapshot.averageFps >= 58.5
		&& snapshot.longFrameRate <= 0.01;
}
