//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAmbientPolicy
 * @description The Awtsmoos can reveal infinite light without asking a battery to imitate infinity;
 * Awtsmoos.com only lowers the canonical cosmic profile, keeping social ambience sparse, calm, and device-aware.
 */
const SOCIAL_CEILING = Object.freeze({
	particles: 900,
	mobileParticles: 320,
	pixelRatio: 1,
	motionScale: 0.24,
	frameInterval: 1000 / 30,
	mobileFrameInterval: 1000 / 20
});

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function collectAmbientSignals(navigatorRef = {}, windowRef = globalThis) {
	const width = number(windowRef?.innerWidth, 1024);
	return {
		width,
		narrow: width < 620,
		coarse: Boolean(windowRef?.matchMedia?.('(pointer: coarse)')?.matches),
		reducedMotion: Boolean(windowRef?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches),
		saveData: Boolean(navigatorRef?.connection?.saveData),
		memory: number(navigatorRef?.deviceMemory, 4),
		cores: number(navigatorRef?.hardwareConcurrency, 4)
	};
}

export function shouldUseSocialAmbient(signals = {}) {
	if (signals.saveData) return false;
	if (number(signals.memory, 4) <= 2) return false;
	if (number(signals.cores, 4) <= 2) return false;
	return true;
}

export function socialAmbientProfile(profile = {}, signals = {}) {
	const constrained = Boolean(signals.narrow || signals.coarse);
	const particleCap = constrained ? SOCIAL_CEILING.mobileParticles : SOCIAL_CEILING.particles;
	const intervalFloor = constrained ? SOCIAL_CEILING.mobileFrameInterval : SOCIAL_CEILING.frameInterval;
	return {
		...profile,
		name: `social-${profile.name || 'adaptive'}`,
		maximumPixelRatio: Math.min(number(profile.maximumPixelRatio, 1), SOCIAL_CEILING.pixelRatio),
		particleCount: Math.min(number(profile.particleCount, particleCap), particleCap),
		glyphCount: 0,
		motionScale: Math.min(number(profile.motionScale, SOCIAL_CEILING.motionScale), SOCIAL_CEILING.motionScale),
		frameInterval: Math.max(number(profile.frameInterval, intervalFloor), intervalFloor),
		reducedMotion: Boolean(profile.reducedMotion || signals.reducedMotion)
	};
}

export { SOCIAL_CEILING, number };
