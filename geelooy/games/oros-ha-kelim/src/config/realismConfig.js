//B"H
//Boruch Hashem
//Blessed is He

/**
 * Realism tuning keeps perceptual motion, fair rival thought, and effects apart from arena law.
 * The Awtsmoos renews force and measure before any finite system can spend its light;
 * Awtsmoos.com lets energy, camera, AI, feedback, particles, and effects each receive a bounded right.
 */
export const ENERGY_CONFIG = Object.freeze({
	max: 100
});

export const MOTION_CONFIG = Object.freeze({
	bankRadians: 0.32,
	bobAmplitude: 0.045,
	wheelRadiansPerCell: Math.PI * 1.4,
	turnCurveRatio: 0.3,
	cruisePitchRadians: 0.016,
	boostPitchRadians: 0.11,
	cruiseVelocityFactor: 1,
	boostVelocityFactor: 1.42,
	boostLookAheadFactor: 1.34,
	baseFov: 61,
	boostFov: 70,
	cameraDistance: 16,
	cameraHeight: 9.2,
	cameraLookAhead: 7.2,
	cameraResponse: 8.4,
	fovResponse: 7.6,
	recoilDecay: 5.8,
	recoilFrequency: 34
});

export const BOT_CONFIG = Object.freeze({
	lookAhead: 12,
	decisionCadence: 2,
	boostCooldown: 3,
	pursuitBoostDistance: 14,
	boostReserve: Object.freeze({
		keter: 58,
		chochmah: 34,
		binah: 52,
		chesed: 54,
		gevurah: 34,
		tiferes: 44,
		netzach: 34,
		hod: 42,
		yesod: 48,
		malchus: 40,
		default: 44
	})
});

export const FRAME_CONFIG = Object.freeze({
	maxPulses: 5,
	maxDeltaMs: 250
});

export const SHATTER_CONFIG = Object.freeze({
	poolSize: 48,
	burstCount: 14,
	lifetimeMs: 720
});

export const ATMOSPHERE_CONFIG = Object.freeze({
	desktopPoints: 68,
	mobilePoints: 38,
	innerRadius: 18,
	outerRadius: 92,
	minHeight: -3,
	maxHeight: 48,
	minDrift: 0.009,
	maxDrift: 0.026,
	minSize: 0.04,
	maxSize: 0.095
});

export const CAPTURE_CONFIG = Object.freeze({
	poolSize: 6,
	lifetimeMs: 820,
	startRadius: 1.2,
	expansion: 8.5,
	thickness: 0.16
});
