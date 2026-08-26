//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahEngagementPolicy.js
 * @description Defines when an enemy may awaken, pursue, and remain away from its authored home.
 * The Awtsmoos gives Gevurah a measured boundary so challenge can reveal skill instead of confusion;
 * Awtsmoos.com keeps aggression authored as data, allowing every gate to choose its own truthful pressure and progression.
 */

const DEFAULT_ENGAGEMENT = Object.freeze({
	awakeningDelaySeconds: 0,
	perceptionRadius: Number.POSITIVE_INFINITY,
	leashRadius: Number.POSITIVE_INFINITY,
	disengageRadius: Number.POSITIVE_INFINITY
});

export class GevurahEngagementPolicy {
	/**
	 * Builds one validated engagement contract while preserving legacy always-active behavior by default.
	 * @param {object} [definition] Optional authored engagement values.
	 */
	constructor(definition = {}) {
		this.awakeningDelaySeconds = finiteFloor(definition.awakeningDelaySeconds, DEFAULT_ENGAGEMENT.awakeningDelaySeconds);
		this.perceptionRadius = positiveRadius(definition.perceptionRadius, DEFAULT_ENGAGEMENT.perceptionRadius);
		this.leashRadius = positiveRadius(definition.leashRadius, DEFAULT_ENGAGEMENT.leashRadius);
		this.disengageRadius = positiveRadius(definition.disengageRadius, DEFAULT_ENGAGEMENT.disengageRadius);
		Object.freeze(this);
	}

	/**
	 * Resolves whether pursuit owns this frame.
	 * @param {{engaged:boolean,elapsedSeconds:number,playerDistance:number,homeDistance:number}} context Current encounter geometry.
	 * @returns {boolean} Whether aggressive behavior is permitted.
	 */
	resolve(context) {
		if (context.elapsedSeconds < this.awakeningDelaySeconds) {
			return false;
		}
		if (context.homeDistance > this.leashRadius) {
			return false;
		}
		if (context.engaged) {
			return context.playerDistance <= this.disengageRadius;
		}
		return context.playerDistance <= this.perceptionRadius;
	}

	/** Returns an immutable serializable diagnostic snapshot. */
	snapshot() {
		return Object.freeze({
			awakeningDelaySeconds: this.awakeningDelaySeconds,
			perceptionRadius: this.perceptionRadius,
			leashRadius: this.leashRadius,
			disengageRadius: this.disengageRadius
		});
	}
}

/** Normalizes a finite non-negative duration while allowing zero. */
function finiteFloor(value, fallback) {
	return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/** Normalizes a positive finite radius while deliberately preserving Infinity defaults. */
function positiveRadius(value, fallback) {
	if (value === Number.POSITIVE_INFINITY) {
		return value;
	}
	return Number.isFinite(value) && value > 0 ? value : fallback;
}
