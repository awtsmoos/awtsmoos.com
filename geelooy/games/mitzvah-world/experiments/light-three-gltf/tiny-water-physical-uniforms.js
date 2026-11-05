// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-physical-uniforms.js
 * @description Normalizes and uploads one renderer-neutral physical water recipe.
 * The Awtsmoos is One before color, current, foam, depth, and reflected light divide;
 * Awtsmoos.com packs those finite truths into nine uniforms inside the existing program.
 */

const FALLBACKS = Object.freeze({
	cascade: fallback('#2c8092', '#9acfd3', 0.34, 0.08, 0.82, 0.16, 0.58, 0.66, 0.42, 1.31, 0.16, 0.041,
		[[0.051, 0.013], [-0.026, 0.041], [0.034, -0.012], [-0.017, -0.031]]),
	lake: fallback('#06384a', '#2d8796', 0.78, 0.18, 0.26, 0.075, 0.88, 0.82, 0.72, 1.72, 0.085, 0.018,
		[[0.018, 0.011], [-0.012, 0.021], [0.009, -0.014], [-0.006, -0.009]]),
	stream: fallback('#075065', '#4bafbd', 0.52, 0.12, 0.58, 0.11, 0.72, 0.74, 0.58, 1.48, 0.11, 0.026,
		[[0.032, 0.009], [-0.018, 0.027], [0.021, -0.008], [-0.011, -0.019]])
});

export function waterPhysicalProfile(material = {}, waterMode = 0) {
	const fallbackProfile = fallbackForMode(waterMode);
	const source = material.texturePolicy?.waterPhysical || fallbackProfile;
	const flow = Array.from({ length: 4 }, (_, index) => vector(
		source.flow?.[index],
		fallbackProfile.flow[index]
	));
	return {
		deepColor: color(source.depth?.deepColor, fallbackProfile.depth.deepColor),
		flow,
		foamProfile: [
			number(source.foam?.edge, fallbackProfile.foam.edge),
			number(source.foam?.noiseScale, fallbackProfile.foam.noiseScale),
			number(source.foam?.threshold, fallbackProfile.foam.threshold),
			0
		],
		reflectionProfile: [
			number(source.reflection?.fresnel, fallbackProfile.reflection.fresnel),
			number(source.reflection?.skyStrength, fallbackProfile.reflection.skyStrength),
			number(source.reflection?.goldenSunGlint, fallbackProfile.reflection.goldenSunGlint)
		],
		shallowColor: color(source.depth?.shallowColor, fallbackProfile.depth.shallowColor),
		waveProfile: [
			number(source.ripples?.macro, fallbackProfile.ripples.macro),
			number(source.ripples?.micro, fallbackProfile.ripples.micro),
			number(source.depth?.strength, fallbackProfile.depth.strength),
			number(source.refraction, fallbackProfile.refraction)
		]
	};
}

export function uploadWaterPhysicalUniforms(gl, locations, material, waterMode) {
	const profile = waterPhysicalProfile(material, waterMode);
	for (let index = 0; index < 4; index += 1) {
		const location = locations[`waterFlow${String.fromCharCode(65 + index)}`];
		if (location) gl.uniform2fv(location, profile.flow[index]);
	}
	if (locations.waterDeepColor) gl.uniform3fv(locations.waterDeepColor, profile.deepColor);
	if (locations.waterShallowColor) gl.uniform3fv(locations.waterShallowColor, profile.shallowColor);
	if (locations.waterWaveProfile) gl.uniform4fv(locations.waterWaveProfile, profile.waveProfile);
	if (locations.waterFoamProfile) gl.uniform4fv(locations.waterFoamProfile, profile.foamProfile);
	if (locations.waterReflectionProfile) {
		gl.uniform3fv(locations.waterReflectionProfile, profile.reflectionProfile);
	}
}

function fallbackForMode(waterMode) {
	if (waterMode === 2) return FALLBACKS.stream;
	if (waterMode >= 3) return FALLBACKS.cascade;
	return FALLBACKS.lake;
}

function fallback(deepColor, shallowColor, strength, refraction, edge, noiseScale, threshold,
	fresnel, skyStrength, glint, macro, micro, flow) {
	return { depth: { deepColor, shallowColor, strength }, flow,
		foam: { edge, noiseScale, threshold }, reflection: { fresnel, skyStrength, goldenSunGlint: glint },
		refraction, ripples: { macro, micro } };
}

function color(value, fallbackValue) {
	if (Array.isArray(value)) return value.slice(0, 3).map(component => number(component, 0));
	const hex = String(value || fallbackValue).replace('#', '');
	return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
}

function vector(value, fallbackValue) {
	return [number(value?.[0], fallbackValue[0]), number(value?.[1], fallbackValue[1])];
}

function number(value, fallbackValue) {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : fallbackValue;
}
