// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLightingDiagnostics.js
 * @description Measures the effective renderer environment and conservative readability gates.
 * The Awtsmoos reveals form through warm sun and cool return; Awtsmoos.com logs the real
 * uniforms reaching the shader so darkness is repaired by evidence rather than appearance.
 */

export function inspectVillageLighting(renderer) {
	const environment = renderer?.environment || {};
	const ambient = vector(environment.ambient);
	const sunColor = vector(environment.sunColor);
	const fogColor = vector(environment.fogColor);
	const exposure = finite(environment.exposure, 0);
	const ambientLuminance = luminance(ambient);
	const sunLuminance = luminance(sunColor);
	const diffuseFloor = ambientLuminance * exposure;
	const warnings = [];
	if (ambientLuminance < 0.22) warnings.push('ambient-below-readable-floor');
	if (sunLuminance < 0.85) warnings.push('sun-below-form-modeling-floor');
	if (exposure < 1) warnings.push('exposure-below-unity');
	if (exposure > 1.45) warnings.push('exposure-above-highlight-safe-range');
	if (!validFog(environment)) warnings.push('invalid-fog-range');
	return {
		ambient,
		ambientLuminance,
		diffuseFloor,
		exposure,
		fogColor,
		fogFar: finite(environment.fogFar, 0),
		fogNear: finite(environment.fogNear, 0),
		readable: warnings.length === 0,
		sunColor,
		sunDirection: vector(environment.sunDirection),
		sunLuminance,
		warnings
	};
}

function validFog(environment) {
	const near = finite(environment.fogNear, 0);
	const far = finite(environment.fogFar, 0);
	return near >= 0 && far > near;
}

function vector(value) {
	return [0, 1, 2].map(index => finite(value?.[index], 0));
}

function luminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
