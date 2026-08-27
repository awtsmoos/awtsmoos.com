// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives anatomy a measured vessel: volume suggests mass, limb
 * reach suggests stride, and flexibility bounds curvature. Awtsmoos.com can
 * inspect every derived value without replacing the genome, rig, or motion
 * systems that already reveal the creature.
 */

const EPSILON = 1e-9;

function finiteNumber(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function freezeValue(value) {
	if (!value || typeof value !== "object" || Object.isFrozen(value)) {
		return value;
	}
	Object.values(value).forEach(freezeValue);
	return Object.freeze(value);
}

function massDistribution(profile) {
	const segments = Array.isArray(profile?.segments) ? profile.segments : [];
	const raw = segments.map((segment) => {
		const length = Math.max(EPSILON, finiteNumber(segment.length_weight, 1));
		const radius = Math.max(EPSILON, finiteNumber(segment.radius_weight, 1));
		return length * radius * radius;
	});
	const total = raw.reduce((sum, value) => sum + value, 0);
	let axialPosition = 0;
	let centerOfMass = 0;
	const normalizedLength = segments.reduce((sum, segment) => (
		sum + Math.max(EPSILON, finiteNumber(segment.length_weight, 1))
	), 0) || 1;
	const resolved = segments.map((segment, index) => {
		const length = Math.max(EPSILON, finiteNumber(segment.length_weight, 1));
		const center = (axialPosition + length * 0.5) / normalizedLength;
		const fraction = total > EPSILON ? raw[index] / total : 1 / segments.length;
		axialPosition += length;
		centerOfMass += center * fraction;
		return { id: String(segment.id || `segment_${index}`), fraction, axial_center: center };
	});
	return { axial_center: segments.length ? centerOfMass : 0.5, segments: resolved };
}

function jointRanges(profile, flexibility) {
	const chains = Array.isArray(profile?.joint_chains) ? profile.joint_chains : [];
	return chains.map((chain, index) => {
		const id = typeof chain === "string" ? chain : String(chain?.id || `chain_${index}`);
		const appendage = /leg|arm|wing|fin|limb|foot|hand/i.test(id);
		const extension = appendage ? 55 + flexibility * 75 : 15 + flexibility * 35;
		const flexion = appendage ? 35 + flexibility * 45 : extension;
		return { id, minimum_degrees: -flexion, maximum_degrees: extension };
	});
}

/**
 * Derives immutable, renderer-neutral biomechanical constraints from an
 * existing morphology profile. Complexity is O(segments + joint chains), has
 * no side effects, performs no random sampling, and replaces invalid numbers
 * with bounded defaults instead of propagating NaN.
 *
 * @param {Object} profile Existing animal morphology profile.
 * @returns {Object} Frozen biomechanics artifact and diagnostics.
 */
export function deriveAnimalBiomechanics(profile = {}) {
	const traits = profile?.genome?.traits || {};
	const bodyLength = Math.max(EPSILON, finiteNumber(traits.body_length, 1));
	const bodyWidth = Math.max(EPSILON, finiteNumber(traits.body_width, 1));
	const limbLength = Math.max(0, finiteNumber(traits.limb_length, traits.appendage_length || 0));
	const legPairs = clamp(Math.round(finiteNumber(traits.leg_pairs, 0)), 0, 16);
	const flexibility = clamp(finiteNumber(traits.flexibility, 0.5), 0, 1);
	const lateralWave = clamp(finiteNumber(traits.lateral_wave, 0), 0, 1);
	const supportWidthRatio = legPairs ? clamp(0.42 + legPairs * 0.12, 0.42, 0.9) : 0;
	const strideRatio = clamp((limbLength / bodyLength) * (0.72 + flexibility * 0.18), 0, 2);
	const maximumCurvature = (0.35 + flexibility * 1.65) / bodyLength;
	const diagnostics = [];
	if (!Array.isArray(profile.segments) || !profile.segments.length) {
		diagnostics.push({ code: "NO_AXIAL_SEGMENTS", severity: "warning" });
	}
	if (legPairs && strideRatio > 1.15) {
		diagnostics.push({ code: "OVERSTRIDE_RISK", severity: "warning", value: strideRatio });
	}
	return freezeValue({
		schema: "awtsmoos.animal.biomechanics",
		version: "1.0.0",
		body_plan: profile.body_plan || "unspecified",
		mass_distribution: massDistribution(profile),
		balance: {
			leg_pairs: legPairs,
			support_width_ratio: supportWidthRatio,
			stride_ratio: strideRatio,
			stability_margin: legPairs ? supportWidthRatio / Math.max(0.25, strideRatio) : 0
		},
		axial: {
			flexibility,
			maximum_curvature: maximumCurvature,
			minimum_bend_radius: 1 / maximumCurvature,
			wave_amplitude: bodyWidth * lateralWave * (0.1 + flexibility * 0.35),
			wave_wavelength: bodyLength * clamp(1.5 - flexibility * 0.5, 0.75, 1.5)
		},
		joint_ranges: jointRanges(profile, flexibility),
		diagnostics,
		provenance: { deterministic: true, model: "allometric-support-v1" }
	});
}
