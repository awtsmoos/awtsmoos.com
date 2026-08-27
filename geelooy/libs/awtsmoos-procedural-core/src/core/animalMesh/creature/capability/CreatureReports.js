// B"H
// Boruch Hashem
// Blessed is He
/**
 * Capability is not cosmetic shape. Awtsmoos.com weighs explicit part powers,
 * reach, support contacts, mass, and motion evidence so bite, grasp, vision,
 * flight, swimming, balance, and clearance remain explainable and overridable.
 */
/** Evaluates semantic creature capabilities in O(parts + limbs + bones). */
export function evaluateCreatureCapabilities(creature, rig, locomotion = null) {
	const partCapabilities = creature.parts.flatMap(part => part.capabilities);
	const supportLimbs = creature.limbs.filter(limb => limb.contactCapabilities.length);
	const reach = creature.limbs.reduce((maximum, limb) => Math.max(
		maximum,
		limb.segments.reduce((sum, segment) => sum + segment.length, 0)
	), 0);
	const eyeCount = creature.parts.filter(part => part.category === "eye").length;
	const scores = {
		bite: partCapabilities.includes("bite") ? 1 : 0,
		grasp: creature.limbs.some(limb => limb.manipulationCapabilities.length) ? 1 : 0,
		vision: Math.min(1, eyeCount / 2),
		hearing: partCapabilities.includes("hearing") ? 1 : 0,
		flight: partCapabilities.includes("flight") ? 1 : 0,
		swimming: partCapabilities.includes("swimming") ? 1 : 0,
		runningStability: locomotion?.stabilityMetrics?.score || Math.min(1, supportLimbs.length / 4),
		maximumReach: reach,
		strideLength: locomotion?.contactTrajectories?.[0]?.strideLength || reach * 0.5,
		groundClearance: locomotion?.contactTrajectories?.[0]?.groundClearance || reach * 0.08,
		balance: Math.min(1, supportLimbs.length / 3),
		jumpPotential: supportLimbs.length ? Math.min(1, reach / 2) : 0
	};
	return Object.freeze({
		creatureId: creature.id,
		rigId: rig.id,
		scores: Object.freeze(scores),
		evidence: Object.freeze({
			partCapabilities: [...new Set(partCapabilities)],
			supportLimbIds: supportLimbs.map(limb => limb.id),
			boneCount: rig.bones.length,
			centerOfMass: rig.centerOfMass
		})
	});
}
