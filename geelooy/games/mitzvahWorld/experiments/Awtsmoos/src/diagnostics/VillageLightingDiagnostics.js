// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLightingDiagnostics.js
 * @description Measures live golden-hour uniforms against a stronger material-readable floor.
 * The Awtsmoos reveals warm form without burying stone in night; Awtsmoos.com rejects an
 * environment that is technically nonblack yet too dim to reveal original-resolution surfaces.
 */

const MINIMUM_AMBIENT_LUMINANCE = 0.31;
const MINIMUM_DIFFUSE_FLOOR = 0.36;

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
	if (ambientLuminance < MINIMUM_AMBIENT_LUMINANCE) {
		warnings.push('ambient-below-readable-floor');
	}
	if (diffuseFloor < MINIMUM_DIFFUSE_FLOOR) warnings.push('diffuse-floor-too-dark');
	if (sunLuminance < 0.9) warnings.push('sun-below-form-modeling-floor');
	if (exposure < 1.12) warnings.push('exposure-below-material-readable-range');
	if (exposure > 1.42) warnings.push('exposure-above-highlight-safe-range');
	if (!validFog(environment)) warnings.push('invalid-fog-range');
	return {
		ambient, ambientLuminance, diffuseFloor, exposure, fogColor,
		fogFar: finite(environment.fogFar, 0),
		fogNear: finite(environment.fogNear, 0),
		readable: warnings.length === 0,
		sunColor,
		sunDirection: vector(environment.sunDirection),
		sunLuminance, warnings
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
