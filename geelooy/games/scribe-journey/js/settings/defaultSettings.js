// B"H

export const SETTINGS_KEY = 'scribe_settings_v1';
export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
	haptics: true,
	highContrast: false,
	joystickSensitivity: 1,
	leftHanded: false,
	particleDensity: 1,
	reducedMotion: false,
	screenShake: true,
	showCoordinates: false,
	touchOpacity: 0.82,
	touchScale: 1,
	uiScale: 1,
	weatherEffects: true
});

const RANGES = Object.freeze({
	joystickSensitivity: [0.5, 1.5],
	particleDensity: [0, 2],
	touchOpacity: [0.45, 1],
	touchScale: [0.8, 1.25],
	uiScale: [0.85, 1.25]
});

function clamp(number, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, number));
}

/** Unknown preferences evaporate; known values return inside humane bounds. */
export function normalizeSettings(candidate = {}) {
	const settings = { ...DEFAULT_SETTINGS };
	for (const key of Object.keys(DEFAULT_SETTINGS)) {
		if (!(key in candidate)) continue;
		if (typeof DEFAULT_SETTINGS[key] === 'boolean') settings[key] = Boolean(candidate[key]);
		else {
			const number = Number(candidate[key]);
			if (Number.isFinite(number)) settings[key] = clamp(number, ...RANGES[key]);
		}
	}
	return settings;
}
