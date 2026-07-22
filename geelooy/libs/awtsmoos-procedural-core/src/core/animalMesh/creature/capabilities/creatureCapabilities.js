// B"H
// Boruch Hashem
// Blessed is He
/**
 * Capability is evidence rather than ornament. The Awtsmoos distinguishes
 * visible shape from functional reach so Awtsmoos.com explains every result.
 */

/** Derives bite, grasp, sensing, locomotion, reach, and balance evidence. */
export function evaluateCreatureCapabilities(creature, rig, locomotion = null) {
	const explicitPartEvidence = {};
	for (const part of creature.parts) {
		for (const [name, value] of Object.entries(
			part.functionalCapabilities || {}
		)) {
			explicitPartEvidence[name] = (
				explicitPartEvidence[name] || 0
			) + Number(value || 0);
		}
	}
	const supportLimbs = creature.limbs.filter(
		(limb) => limb.contactCapabilities.includes("ground.support")
	);
	const manipulationLimbs = creature.limbs.filter(
		(limb) => limb.manipulationCapabilities.length
	);
	const maximumReach = Math.max(
		0,
		...creature.limbs.map((limb) => limb.segments.reduce(
			(sum, segment) => sum + segment.length,
			0
		))
	);
	const hasMouth = creature.parts.some(
		(part) => part.semanticCategory === "mouth"
	);
	return Object.freeze({
		type: "creature-capability-report",
		explicitPartEvidence: Object.freeze(explicitPartEvidence),
		derived: Object.freeze({
			bite: explicitPartEvidence.bite || (hasMouth ? 1 : 0),
			grasp: manipulationLimbs.length,
			vision: creature.parts.filter(
				(part) => part.semanticCategory === "eye"
			).length,
			hearing: creature.parts.filter(
				(part) => part.semanticCategory === "ear"
			).length,
			flight: creature.limbs.filter(
				(limb) => limb.functionalRole.includes("wing")
			).length,
			swimming: creature.limbs.filter(
				(limb) => limb.functionalRole.includes("fin")
			).length,
			runningStability: locomotion?.stabilityMetrics?.estimatedMargin
				|| (supportLimbs.length > 1 ? 0.5 : 0),
			maximumReach,
			strideLength: maximumReach * 0.72,
			groundClearance: Math.max(
				0,
				...rig.contactTargets.map(
					(target) => Math.abs(target.restPosition[1])
				)
			),
			balance: supportLimbs.length
				? Math.min(1, supportLimbs.length / 4)
				: 0,
			jumpPotential: supportLimbs.reduce(
				(sum, limb) => sum + limb.locomotionImportance,
				0
			) / Math.max(1, supportLimbs.length)
		}),
		evidence: Object.freeze({
			supportLimbIds: supportLimbs.map((limb) => limb.id),
			manipulationLimbIds: manipulationLimbs.map((limb) => limb.id),
			rigHash: rig.contentHash
		})
	});
}
