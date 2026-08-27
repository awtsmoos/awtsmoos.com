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
	bankRadians: 0.28,
	bobAmplitude: 0.055,
	wheelRadiansPerCell: Math.PI * 1.4,
	turnCurveRatio: 0.28,
	cruisePitchRadians: 0.018,
	boostPitchRadians: 0.105,
	cruiseVelocityFactor: 1,
	boostVelocityFactor: 1.38,
	boostLookAheadFactor: 1.28,
	baseFov: 58,
	boostFov: 66,
	cameraDistance: 13,
	cameraHeight: 8.2,
	cameraLookAhead: 5.5,
	cameraLerp: 0.14,
	fovLerp: 0.12
});

export const BOT_CONFIG = Object.freeze({
	lookAhead: 4,
	decisionCadence: 2,
	boostCooldown: 3,
	pursuitBoostDistance: 6,
	boostReserve: Object.freeze({
		chesed: 54,
		gevurah: 36,
		tiferes: 45,
		netzach: 36,
		default: 45
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
	desktopPoints: 64,
	mobilePoints: 36,
	innerRadius: 16,
	outerRadius: 62,
	minHeight: -2,
	maxHeight: 34,
	minDrift: 0.012,
	maxDrift: 0.032,
	minSize: 0.045,
	maxSize: 0.1
});

export const CAPTURE_CONFIG = Object.freeze({
	poolSize: 6,
	lifetimeMs: 820,
	startRadius: 1.2,
	expansion: 8.5,
	thickness: 0.16
});
