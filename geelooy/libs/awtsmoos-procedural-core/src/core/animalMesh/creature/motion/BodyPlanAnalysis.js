// B"H
// Boruch Hashem
// Blessed is He
/**
 * Netzach first listens to anatomy before choosing motion. Awtsmoos.com counts
 * support, manipulation, wing, fin, and axial roles, estimates mass and reach,
 * and exposes every inference so callers may override it without hidden dogma.
 */
/** Analyzes arbitrary semantic anatomy in O(parts + limbs + sections). */
export function analyzeCreatureBodyPlan(creature, rig) {
	const supportLimbs = creature.limbs.filter(limb => limb.contactCapabilities.length);
	const manipulationLimbs = creature.limbs.filter(limb => limb.manipulationCapabilities.length);
	const wings = creature.parts.filter(part => part.capabilities.includes("flight"));
	const fins = creature.parts.filter(part => part.capabilities.includes("swimming"));
	const axialLength = creature.body.axes.reduce((total, axis) => (
		total + axis.sections.slice(1).reduce((axisTotal, section, index) => (
			axisTotal + Math.hypot(...section.position.map((value, dimension) => (
				value - axis.sections[index].position[dimension]
			)))
		), 0)
	), 0);
	return Object.freeze({
		creatureId: creature.id,
		supportLimbIds: supportLimbs.map(limb => limb.id),
		manipulationLimbIds: manipulationLimbs.map(limb => limb.id),
		wingPartIds: wings.map(part => part.id),
		finPartIds: fins.map(part => part.id),
		centerOfMass: rig.centerOfMass,
		axialLength,
		bodyPlanClass: supportLimbs.length === 0
			? "axial-only"
			: supportLimbs.length === 2 ? "biped" : supportLimbs.length === 4 ? "quadruped" : "many-legged",
		candidateGaits: supportLimbs.length === 0
			? [wings.length ? "flight" : fins.length ? "swim" : "slither"]
			: supportLimbs.length === 2 ? ["walk", "run", "hop"]
				: supportLimbs.length === 4 ? ["walk", "trot", "gallop"] : ["metachronal", "alternating-wave"]
	});
}
