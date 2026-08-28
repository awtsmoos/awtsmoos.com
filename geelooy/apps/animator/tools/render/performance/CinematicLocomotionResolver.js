// B"H
// Boruch Hashem
// Blessed is He

/**
 * Resolves authored travel into contact-aware body mechanics for rendered actors.
 * The Awtsmoos renews each planted instant; Awtsmoos.com lets stance carry weight
 * while swing, breath, counter-motion, and head stabilization overlap without skating.
 */
export class CinematicLocomotionResolver {
	/**
	 * @param {object} options Authored performance and measured shot-travel channels.
	 * @param {object} dimensions Character dimensions in render pixels.
	 * @returns {object} Runtime-only gait recipe; no authored project state is mutated.
	 */
	static resolve(options, dimensions) {
		const timeMs = Number(options.timeMs || 0);
		const walk = this.clamp(Number(options.walk || 0), 0, 1);
		const speed = this.clamp(Number(options.speed || 1), 0.35, 2.4);
		const worldSpeed = Math.max(0, Number(options.worldSpeed || 0));
		const authoredCadence = 0.72 + speed * 0.52;
		const travelCadence = worldSpeed > 1 ? this.clamp(worldSpeed / 30, 0.72, 2.3) : authoredCadence;
		const cadenceHz = authoredCadence * 0.68 + travelCadence * 0.32;
		const seed = Number(options.phase || 0) / (Math.PI * 2);
		const cycle = this.wrap(timeMs * cadenceHz / 1000 + seed);
		const phase = cycle * Math.PI * 2;
		const energy = this.clamp(walk * (0.72 + speed * 0.24), 0, 1.25);
		const breathIntent = this.clamp(Number(options.breath || 0), 0, 1);
		const exertion = this.clamp(Number(options.exertion || 0), 0, 1.5);
		const breathPeriod = 1750 - (breathIntent + exertion * 0.35) * 620;
		const breath = Math.sin(timeMs / breathPeriod * Math.PI * 2 + seed * 3.1)
			* dimensions.scale * (0.55 + breathIntent * 1.35 + exertion * 0.45);
		const pelvisY = walk < 0.08 ? 0 : (1 - Math.cos(phase * 2)) * dimensions.scale * 1.7 * energy;
		const counter = Math.sin(phase) * dimensions.bodyWidth * 0.035 * energy;
		return {
			cycle,
			phase,
			cadenceHz,
			breath,
			pelvisY,
			torsoSway: -counter,
			headSway: counter * 0.42,
			headCompensation: -pelvisY * 0.58,
			armSwing: this.clamp(Number(options.armSwing ?? 1), 0, 1.6),
			legs: {
				left: this.leg(cycle + 0.5, dimensions, walk, speed),
				right: this.leg(cycle, dimensions, walk, speed)
			}
		};
	}

	/** @returns {object} One leg's local foot offset and contact state. */
	static leg(rawCycle, dimensions, walk, speed) {
		const cycle = this.wrap(rawCycle);
		if (walk < 0.08) return { x: 0, y: 0, contact: true, phase: 'plant' };
		const stride = dimensions.legHeight * this.clamp(0.18 + speed * 0.065, 0.2, 0.36) * walk;
		const lift = dimensions.legHeight * this.clamp(0.045 + speed * 0.038, 0.055, 0.14) * walk;
		if (cycle < 0.5) {
			const stance = cycle / 0.5;
			return {
				x: stride * (0.5 - stance),
				y: Math.sin(stance * Math.PI) * dimensions.scale * 1.2 * walk,
				contact: true,
				phase: stance < 0.25 ? 'contact' : stance < 0.65 ? 'down' : 'passing'
			};
		}
		const swing = (cycle - 0.5) / 0.5;
		const eased = swing * swing * (3 - 2 * swing);
		return {
			x: stride * (-0.5 + eased),
			y: -Math.sin(swing * Math.PI) * lift,
			contact: false,
			phase: swing < 0.55 ? 'up' : 'reach'
		};
	}

	static wrap(value) {
		return ((value % 1) + 1) % 1;
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}
}
