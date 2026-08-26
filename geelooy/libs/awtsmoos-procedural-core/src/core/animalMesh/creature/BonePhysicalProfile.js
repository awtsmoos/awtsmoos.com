// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BonePhysicalProfile.js
 * @description Describes renderer-neutral physical bone form independently from rig identity and pose.
 * RESPONSIBILITY: derive taper, cortical shell, marrow cavity, joint caps, density, and tissue influence envelopes from semantic bone dimensions.
 * NON-RESPONSIBILITY: this module does not generate meshes, solve constraints, or alter skin indices.
 * The Awtsmoos gives the hidden support its measured vessel; Awtsmoos.com lets every bone carry inner chamber, outer strength, and living influence without confusing essence with geometry.
 */

const ROLE_PRESETS = Object.freeze({
	'axial.spine': preset(0.22, 0.58, 0.14, 1.18, 0.9),
	'locomotion.root': preset(0.3, 0.5, 0.18, 1.3, 1),
	'facial.jaw': preset(0.18, 0.48, 0.11, 1.08, 0.82),
	'propulsion.wing': preset(0.12, 0.72, 0.08, 0.92, 0.7),
	'propulsion.fin': preset(0.13, 0.66, 0.09, 0.96, 0.72),
	'secondary.tail': preset(0.16, 0.62, 0.08, 0.98, 0.72)
});

/**
 * Creates one immutable physical profile for a semantic rig bone.
 * @param {object} bone Bone contract containing role, radius, and length.
 * @param {object} overrides Optional physical morphology overrides.
 * @returns {object} Frozen physical-envelope metadata.
 */
export function createBonePhysicalProfile(bone = {}, overrides = {}) {
	const role = String(bone.semanticRole || 'secondary.motion');
	const source = rolePreset(role);
	const radius = positive(bone.radius, 0.05);
	const length = Math.max(0, finite(bone.length, 0.1));
	const taper = clamp(overrides.taper ?? source.taper, 0, 0.92);
	const corticalRatio = clamp(overrides.corticalRatio ?? source.corticalRatio, 0.05, 0.95);
	return Object.freeze({
		corticalRatio,
		density: positive(overrides.density, source.density),
		influenceEnvelope: Object.freeze({
			jointGain: positive(overrides.jointGain, source.jointGain),
			lengthRadiusRatio: positive(overrides.lengthRadiusRatio, 0.17),
			radialMultiplier: positive(overrides.radialMultiplier, source.radialMultiplier)
		}),
		jointCaps: Object.freeze({
			headRadius: radius * positive(overrides.headCapScale, 1.12),
			tailRadius: radius * positive(overrides.tailCapScale, 1.08)
		}),
		length,
		marrowRadius: radius * (1 - corticalRatio),
		radiusEnd: Math.max(0.002, radius * (1 - taper)),
		radiusStart: radius,
		taper,
		type: 'semantic-bone-physical-profile',
		version: '1.0.0'
	});
}

/** Returns a role preset, matching useful prefixes before falling back safely. */
function rolePreset(role) {
	if (ROLE_PRESETS[role]) {
		return ROLE_PRESETS[role];
	}
	if (/locomotion|support/.test(role)) {
		return preset(0.17, 0.7, 0.12, 1.24, 0.94);
	}
	if (/sensory|antenna|ear|eye/.test(role)) {
		return preset(0.22, 0.42, 0.08, 0.86, 0.62);
	}
	return preset(0.2, 0.58, 0.1, 1.05, 0.78);
}

/** Creates one compact immutable preset. */
function preset(taper, corticalRatio, density, radialMultiplier, jointGain) {
	return Object.freeze({ corticalRatio, density, jointGain, radialMultiplier, taper });
}

/** Returns a finite numeric input or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Returns a positive finite numeric input or fallback. */
function positive(value, fallback) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

/** Clamps a finite value into a closed interval. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, finite(value, minimum)));
}
