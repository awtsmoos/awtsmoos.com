// B"H
// Boruch Hashem
// Blessed is He

/** Calculates center of mass from semantic section mass contributions. */
export function calculateSemanticCenterOfMass(creature) {
	let totalMass = 0;
	const weighted = [0, 0, 0];
	for (const section of creature.body.sections) {
		totalMass += section.massContribution;
		section.position.forEach((value, index) => {
			weighted[index] += value * section.massContribution;
		});
	}
	return totalMass
		? weighted.map((value) => value / totalMass)
		: [0, 0, 0];
}
