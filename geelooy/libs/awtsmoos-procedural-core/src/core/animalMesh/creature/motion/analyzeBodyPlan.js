// B"H
// Boruch Hashem
// Blessed is He
/**
 * Motion begins by listening to anatomy. The Awtsmoos reveals support, wings,
 * fins, and axial continuity so Awtsmoos.com never forces every life into biped.
 */

/**
 * Classifies a body plan and candidate gait families from semantic evidence.
 * Complexity: O(l). Determinism: complete. Side effects: none.
 */
export function analyzeCreatureBodyPlan(creature, rig) {
	const supportLimbs = creature.limbs.filter(
		(limb) => limb.contactCapabilities.includes("ground.support")
	);
	const wingLimbs = creature.limbs.filter(
		(limb) => limb.functionalRole.includes("wing")
	);
	const finLimbs = creature.limbs.filter(
		(limb) => limb.functionalRole.includes("fin")
	);
	const longUnsupportedAxis = creature.body.sections.length >= 8
		&& supportLimbs.length === 0;
	let bodyPlan = "asymmetric-support";
	if (wingLimbs.length) {
		bodyPlan = "winged";
	} else if (finLimbs.length) {
		bodyPlan = "finned";
	} else if (longUnsupportedAxis) {
		bodyPlan = "serpentine";
	} else if (supportLimbs.length === 2) {
		bodyPlan = "biped";
	} else if (supportLimbs.length === 4) {
		bodyPlan = "quadruped";
	} else if (supportLimbs.length > 4) {
		bodyPlan = "many-legged";
	} else if (supportLimbs.length === 0) {
		bodyPlan = "floating";
	}
	const gaitCandidates = bodyPlan === "serpentine"
		? ["slither", "swim"]
		: bodyPlan === "winged"
			? ["fly", "walk"]
			: bodyPlan === "finned"
				? ["swim"]
				: bodyPlan === "floating"
					? ["drift", "roll"]
					: supportLimbs.length > 4
						? ["metachronal", "crawl"]
						: ["walk", "run", "jump"];
	return Object.freeze({
		bodyPlan,
		supportLimbIds: supportLimbs.map((limb) => limb.id),
		wingLimbIds: wingLimbs.map((limb) => limb.id),
		finLimbIds: finLimbs.map((limb) => limb.id),
		centerOfMass: rig.centerOfMass,
		gaitCandidates,
		evidence: {
			supportCount: supportLimbs.length,
			axialSectionCount: creature.body.sections.length,
			contactTargetCount: rig.contactTargets.length
		}
	});
}
