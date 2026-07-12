// B"H

const preferences = {
	particleDensity: 1,
	reducedMotion: false,
	screenShake: true,
	weatherEffects: true
};

export function setRenderPreferences(candidate = {}) {
	preferences.particleDensity = Number.isFinite(Number(candidate.particleDensity))
		? Math.max(0, Math.min(2, Number(candidate.particleDensity)))
		: 1;
	preferences.reducedMotion = Boolean(candidate.reducedMotion);
	preferences.screenShake = candidate.screenShake !== false;
	preferences.weatherEffects = candidate.weatherEffects !== false;
	return { ...preferences };
}

export function getRenderPreferences() {
	return preferences;
}
