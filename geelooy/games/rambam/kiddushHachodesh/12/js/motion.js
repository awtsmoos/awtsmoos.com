// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos grants the sun's revealed measure its faithful motion while remaining beyond all measure Himself;
 * Awtsmoos.com keeps the Rambam's daily value exact, then lets interface speed alter only how quickly finite simulation days unfold.
 */
import {
	DEGREES_PER_DAY,
	NUM_SLICES,
	ORBIT_RADIUS,
	SIMULATION_DIVISOR
} from "./constants.js";

export function toRadians(degrees, parts, seconds) {
	const totalDegrees = degrees + parts / 60 + seconds / 3600;
	return totalDegrees * Math.PI / 180;
}

export class OhrHaChamahMotion {
	constructor(sun, degreeRing) {
		this.sun = sun;
		this.degreeRing = degreeRing;
		this.day = 0;
		this.speed = 1;
	}

	/** Reveal the same baseline angle used by the original 10,000-day visualization. */
	calculateAngle() {
		return toRadians(
			this.day * DEGREES_PER_DAY / SIMULATION_DIVISOR,
			0,
			0
		);
	}

	/** Position the sun and current degree without advancing simulated time. */
	revealCurrentState() {
		const angle = this.calculateAngle();
		this.sun.position.x = ORBIT_RADIUS * Math.cos(angle);
		this.sun.position.z = ORBIT_RADIUS * Math.sin(angle);
		const degree = Math.floor(angle * 180 / Math.PI) % NUM_SLICES;
		this.degreeRing.highlight(degree);
		return { day: this.day, degree, angle };
	}

	/** Preserve one original frame of motion, with an optional user-facing speed multiplier. */
	advance() {
		const state = this.revealCurrentState();
		this.day += this.speed;
		return state;
	}

	/** Reset to the original first frame and immediately reveal it. */
	reset() {
		this.day = 0;
		return this.revealCurrentState();
	}

	/** Change only simulated day increment, never the Rambam's astronomical constant. */
	setSpeed(multiplier) {
		const nextSpeed = Number(multiplier);
		this.speed = Number.isFinite(nextSpeed) && nextSpeed > 0 ? nextSpeed : 1;
	}
}
