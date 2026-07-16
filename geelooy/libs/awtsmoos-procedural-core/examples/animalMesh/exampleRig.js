// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function createExampleAnimalRig() {
	return {
		enabled: true,
		type: "quadruped",
		bones: [
			{
				id: "root",
				parent: null,
				head: [
					0,
					0,
					0
				],
				tail: [
					0,
					0,
					0.5
				]
			},
			{
				id: "spine_01",
				parent: "root",
				head: [
					0,
					-0.6,
					1.1
				],
				tail: [
					0,
					0.45,
					1.18
				]
			}
		],
		weighting: {
			method: "automatic_then_constrained_cleanup",
			maximum_influences_per_vertex: 4
		}
	};
}
