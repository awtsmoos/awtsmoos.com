// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos measures each device before pouring light, preserving a rich low vessel when further subtraction brings no measurable relief.

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

export class ParticleQualityPolicy {
	constructor(environment = {}) {
		this.environment = {
			deviceMemory: environment.deviceMemory ?? navigator.deviceMemory ?? 4,
			height: environment.height ?? innerHeight,
			isMobile: environment.isMobile ?? matchMedia("(max-width: 680px)").matches,
			isReducedMotion: environment.isReducedMotion ?? matchMedia("(prefers-reduced-motion: reduce)").matches,
			width: environment.width ?? innerWidth
		};
	}

	createProfile() {
		const area = this.environment.width * this.environment.height;
		const mobileFactor = this.environment.isMobile ? .58 : 1;
		const memoryFactor = this.environment.deviceMemory <= 4 ? .72 : 1;
		const motionFactor = this.environment.isReducedMotion ? .52 : 1;
		const densityFactor = mobileFactor * memoryFactor * motionFactor;
		const tier = this.resolveTier();

		return {
			tier,
			isMobile: this.environment.isMobile,
			dustAmount: Math.round(clamp(area / 1800 * densityFactor, 220, 1100)),
			starAmount: Math.round(clamp(area / 5200 * densityFactor, 90, 420)),
			glyphAmount: Math.round(clamp(area / 72000 * densityFactor, 10, 24)),
			dprCap: this.environment.isMobile ? 1.25 : 1.6,
			targetFrameMs: this.environment.isMobile ? 22 : 17,
			isStatic: this.environment.isReducedMotion
		};
	}

	downgrade(profile) {
		return {
			...profile,
			tier: "low",
			dustAmount: Math.max(160, Math.round(profile.dustAmount * .58)),
			starAmount: Math.max(64, Math.round(profile.starAmount * .62)),
			glyphAmount: Math.max(8, Math.round(profile.glyphAmount * .72)),
			dprCap: Math.min(profile.dprCap, 1.15),
			targetFrameMs: 28
		};
	}

	resolveTier() {
		if (this.environment.isReducedMotion) {
			return "static";
		}

		if (this.environment.isMobile || this.environment.deviceMemory <= 4) {
			return "balanced";
		}

		return "high";
	}
}
