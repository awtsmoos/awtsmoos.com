// B"H
// Boruch Hashem
// Blessed is He
/**
 * Tissue gives semantic anatomy layered physical character. The Awtsmoos lets
 * Awtsmoos.com derive muscle, fat, dermis, keratin, and secondary motion without
 * making a tissue mesh authoritative over Briah.
 */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

function tissueFor(role, radius, options) {
	const support = /support|locomotion/.test(role);
	const sensory = /eye|ear|antenna|sensory/.test(role);
	return Object.freeze({
		muscle: clamp((support ? 0.72 : sensory ? 0.18 : 0.46) * options.muscleScale, 0, 1),
		adipose: clamp((support ? 0.18 : 0.32) * options.fatScale, 0, 1),
		dermisThickness: Math.max(0.001, radius * options.skinThicknessScale),
		stiffness: clamp(sensory ? 0.16 : support ? 0.68 : 0.42, 0, 1),
		damping: clamp(sensory ? 0.22 : 0.38, 0, 1),
		volumePreservation: support ? 0.88 : 0.72
	});
}

/** Creates stable tissue recipes for axial, limb, and part semantic regions. */
export function createCreatureTissueProfile(creature, input = {}) {
	const options = {
		muscleScale: Math.max(0, Number(input.muscleScale ?? 1)),
		fatScale: Math.max(0, Number(input.fatScale ?? 1)),
		skinThicknessScale: Math.max(0.001, Number(input.skinThicknessScale ?? 0.08))
	};
	const regions = [];
	for (const section of creature.body.sections) {
		regions.push(Object.freeze({
			regionId: section.id,
			role: section.anatomicalTags?.[0] ?? "axial.body",
			tissue: tissueFor("axial.body", Math.min(...section.ellipticalRadius), options)
		}));
	}
	for (const limb of creature.limbs) for (const segment of limb.segments) {
		regions.push(Object.freeze({
			regionId: segment.id,
			role: limb.functionalRole,
			tissue: tissueFor(limb.functionalRole, (segment.radiusStart + segment.radiusEnd) * 0.5, options)
		}));
	}
	for (const part of creature.parts) {
		regions.push(Object.freeze({
			regionId: part.id,
			role: part.semanticCategory ?? part.category ?? "part",
			tissue: tissueFor(part.semanticCategory ?? part.category ?? "part", Number(part.parameters?.radius ?? 0.08), options)
		}));
	}
	return Object.freeze({
		type: "creature-tissue-profile",
		version: "1.0.0",
		sourceBriahId: creature.id,
		sourceBriahHash: creature.contentHash,
		regions: Object.freeze(regions),
		deformationPolicy: Object.freeze({
			muscleBulge: true,
			jointVolumePreservation: true,
			fatInertia: true,
			dermisSlide: true,
			secondaryMotion: true
		})
	});
}
