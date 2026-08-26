//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KineticMotionLaw.js
 * @description Defines pure deterministic motion for Ohrbound's moving traversal family.
 * The Awtsmoos renews every ascent, return, and falling step before motion can claim a past;
 * Awtsmoos.com lets finite platforms dance by one measured law so physics and sight remain steadfast.
 */
const TAU = Math.PI * 2;

export class KineticMotionLaw {
	constructor() {
		this.horizontalRange = 1.55;
		this.horizontalSpeed = 1.05;
		this.elevatorRange = 1.35;
		this.elevatorSpeed = 0.92;
		this.fragileDelay = 0.38;
		this.fragileFallTime = 0.92;
		this.fragileResetTime = 2.7;
		this.fragileGravity = 13.5;
		this.springSpeed = 15.2;
	}

	/** Samples one platform without depending on rendering, input, or wall-clock time. */
	sample(platform, elapsed) {
		if (platform.kind === "movingPlatform") {
			return this.horizontal(platform, elapsed);
		}
		if (platform.kind === "elevator") {
			return this.elevator(platform, elapsed);
		}
		if (platform.kind === "fragile") {
			return this.fragile(platform, elapsed);
		}
		return this.rest(platform);
	}

	/** Sweeps a platform left and right around its authored cell. */
	horizontal(platform, elapsed) {
		return {
			x: platform.originX + Math.sin(elapsed * this.horizontalSpeed + platform.phase) * this.horizontalRange,
			y: platform.originY,
			visible: true
		};
	}

	/** Lifts and lowers an elevator without changing horizontal authored truth. */
	elevator(platform, elapsed) {
		return {
			x: platform.originX,
			y: platform.originY + Math.sin(elapsed * this.elevatorSpeed + platform.phase) * this.elevatorRange,
			visible: true
		};
	}

	/** Holds, falls, vanishes, then marks a fragile step ready for rebirth. */
	fragile(platform, elapsed) {
		if (platform.triggeredAt === null) {
			return this.rest(platform);
		}
		const age = elapsed - platform.triggeredAt;
		if (age < this.fragileDelay) {
			return this.rest(platform);
		}
		if (age >= this.fragileResetTime) {
			return { ...this.rest(platform), reset: true };
		}
		const fallingAge = age - this.fragileDelay;
		return {
			x: platform.originX,
			y: platform.originY - 0.5 * this.fragileGravity * fallingAge * fallingAge,
			visible: fallingAge < this.fragileFallTime
		};
	}

	/** Returns one unmoving platform state. */
	rest(platform) {
		return { x: platform.originX, y: platform.originY, visible: true };
	}

	/** Gives authored platforms deterministic but visibly different oscillation phases. */
	phaseFor(index, x, y) {
		return (index * 1.17 + x * 0.23 + y * 0.31) % TAU;
	}
}
