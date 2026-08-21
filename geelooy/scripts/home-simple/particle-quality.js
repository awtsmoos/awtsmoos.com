// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos pours only the light a vessel can carry; Awtsmoos.com keeps the
 * WebGL sky rich on strong screens, quiet on phones, and still when data asks so.
 */

/** Bound one finite measure while the Awtsmoos remains beyond every boundary. */
function clampOhr(ohrValue, ohrMinimum, ohrMaximum) {
	return Math.min(ohrMaximum, Math.max(ohrMinimum, ohrValue));
}

/** Read a media preference without assuming a browser exists during contract tests. */
function revealsMediaPreference(ohrQuery) {
	return typeof globalThis.matchMedia === "function" && globalThis.matchMedia(ohrQuery).matches;
}

export class ParticleQualityPolicy {
	constructor(ohrEnvironment = {}) {
		const keliNavigator = globalThis.navigator ?? {};
		const keliConnection = keliNavigator.connection ?? {};
		this.environment = {
			deviceMemory: ohrEnvironment.deviceMemory ?? keliNavigator.deviceMemory ?? 4,
			hardwareConcurrency: ohrEnvironment.hardwareConcurrency ?? keliNavigator.hardwareConcurrency ?? 4,
			height: ohrEnvironment.height ?? globalThis.innerHeight ?? 800,
			isMobile: ohrEnvironment.isMobile ?? revealsMediaPreference("(max-width: 680px)"),
			isReducedMotion: ohrEnvironment.isReducedMotion ?? revealsMediaPreference("(prefers-reduced-motion: reduce)"),
			saveData: ohrEnvironment.saveData ?? Boolean(keliConnection.saveData),
			width: ohrEnvironment.width ?? globalThis.innerWidth ?? 1280
		};
	}

	/** Reveal the initial particle vessel from viewport, memory, CPU, and user preference. */
	createProfile() {
		const ohrArea = this.environment.width * this.environment.height;
		const ohrMobileFactor = this.environment.isMobile ? .42 : 1;
		const ohrMemoryFactor = this.environment.deviceMemory <= 4 ? .7 : 1;
		const ohrProcessorFactor = this.environment.hardwareConcurrency <= 4 ? .75 : 1;
		const ohrDataFactor = this.environment.saveData ? .42 : 1;
		const ohrMotionFactor = this.environment.isReducedMotion ? .5 : 1;
		const ohrDensity = ohrMobileFactor * ohrMemoryFactor * ohrProcessorFactor * ohrDataFactor * ohrMotionFactor;
		const keliMinimums = this.resolveMinimums();
		const keliMaximums = this.environment.isMobile
			? { dust: 360, stars: 180, glyphs: 12 }
			: { dust: 900, stars: 320, glyphs: 20 };

		return {
			tier: this.resolveTier(),
			isMobile: this.environment.isMobile,
			dustAmount: Math.round(clampOhr(ohrArea / 1900 * ohrDensity, keliMinimums.dust, keliMaximums.dust)),
			starAmount: Math.round(clampOhr(ohrArea / 5600 * ohrDensity, keliMinimums.stars, keliMaximums.stars)),
			glyphAmount: Math.round(clampOhr(ohrArea / 76000 * ohrDensity, keliMinimums.glyphs, keliMaximums.glyphs)),
			dprCap: this.environment.saveData ? 1 : this.environment.isMobile ? 1.1 : 1.5,
			targetFrameMs: this.environment.isMobile ? 32 : 20,
			isStatic: this.environment.isReducedMotion || this.environment.saveData
		};
	}

	/** Reduce an already-running sky once if measured cadence proves too expensive. */
	downgrade(keliProfile) {
		return {
			...keliProfile,
			tier: "low",
			dustAmount: Math.max(56, Math.round(keliProfile.dustAmount * .58)),
			starAmount: Math.max(28, Math.round(keliProfile.starAmount * .6)),
			glyphAmount: Math.max(4, Math.round(keliProfile.glyphAmount * .66)),
			dprCap: Math.min(keliProfile.dprCap, 1),
			targetFrameMs: 34
		};
	}

	/** Keep the hard floors small enough that a phone can truly become lightweight. */
	resolveMinimums() {
		const ohrSavingFactor = this.environment.saveData ? .55 : 1;
		const keliBase = this.environment.isMobile
			? { dust: 84, stars: 40, glyphs: 5 }
			: { dust: 170, stars: 70, glyphs: 8 };
		return {
			dust: Math.round(keliBase.dust * ohrSavingFactor),
			stars: Math.round(keliBase.stars * ohrSavingFactor),
			glyphs: Math.max(3, Math.round(keliBase.glyphs * ohrSavingFactor))
		};
	}

	/** Name the quality tier without confusing visual richness with device worth. */
	resolveTier() {
		if (this.environment.isReducedMotion || this.environment.saveData) return "static";
		if (this.environment.isMobile || this.environment.deviceMemory <= 4 || this.environment.hardwareConcurrency <= 4) return "balanced";
		return "high";
	}
}
