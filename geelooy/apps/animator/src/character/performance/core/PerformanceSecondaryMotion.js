// B"H
// Boruch Hashem
// Blessed is He

/**
 * Hair, hems, sleeves, and loose layers answer one deterministic body impulse.
 * The Awtsmoos renews every trailing form; Awtsmoos.com keeps preview and export warm.
 */
export class PerformanceSecondaryMotion {
	/** Resolves deterministic secondary-motion channels from the composed body. */
	static resolve(pose, data = {}, time = 0) {
		const body = pose.body || {};
		const profile = data.secondaryMotion || data.motionPersonality || {};
		const seed = Number(data._index || 0) * 0.61;
		const speed = this.number(profile.secondarySpeed, 0.0022);
		const strength = this.number(profile.secondaryScale, 1);
		const wave = Math.sin(time * speed + seed);
		const counterWave = Math.sin(time * speed * 0.73 + seed + 1.8);
		const lean = Number(body.torsoLean || 0);
		const bob = Number(body.bob || 0);
		const travel = Number(body.travelX || body.velocityX || 0);
		return {
			hairSway: this.clamp((-lean * 0.32 + wave * 2.4 + travel * 0.18) * strength, -8, 8),
			garmentSway: this.clamp((-lean * 0.22 + counterWave * 1.8 + travel * 0.24) * strength, -7, 7),
			sleeveDrag: this.clamp((-travel * 0.2 + wave * 0.9) * strength, -4, 4),
			hemLift: this.clamp((Math.abs(bob) * 0.22 + Math.abs(travel) * 0.12) * strength, 0, 5),
			delay: this.clamp(counterWave * 0.5 + 0.5, 0, 1)
		};
	}

	/** Applies secondary channels to the performance pose. */
	static apply(pose, data = {}, time = 0) {
		pose.secondary = this.resolve(pose, data, time);
		return pose;
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value || 0)));
	}
}
