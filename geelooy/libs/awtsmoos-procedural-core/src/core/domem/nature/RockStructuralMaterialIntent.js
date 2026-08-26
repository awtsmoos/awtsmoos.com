// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockStructuralMaterialIntent.js
 * @description Translates seed-coherent bedding, joint sets, and exposure direction into renderer-neutral surface-projection evidence.
 * The Awtsmoos renews mineral layer and broken face before a texture can cling to stone; Awtsmoos.com lets Malchus carry the hidden geological directions outward,
 * so triplanar shaders, procedural materials, and remote texture adapters may align finite detail with the same structure that already shaped the mesh below.
 */

/**
 * Creates immutable structural geology hints for material adapters without fetching or instantiating renderer resources.
 * @param {object|null} keterGeology - Seed-derived structural geology profile.
 * @param {object} [chochmahProfile={}] Normalized geological profile controlling visible strengths.
 * @returns {Readonly<object>} Projection, bedding, joint, and exposure evidence.
 */
export function createRockStructuralMaterialIntent(keterGeology, chochmahProfile = {}) {
	if (!keterGeology) {
		return Object.freeze({ projection: 'triplanar' });
	}
	return Object.freeze({
		bedding: Object.freeze({
			frequency: Number(keterGeology.bedding?.frequency ?? 0),
			normal: keterGeology.bedding?.normal || keterGeology.strataAxis,
			phase: Number(keterGeology.bedding?.phase ?? 0),
			strength: unit(chochmahProfile.strata)
		}),
		exposureAxis: keterGeology.exposureAxis || keterGeology.ridgeAxis,
		jointSets: Object.freeze((keterGeology.jointSets || []).map((binahJoint) => {
			return Object.freeze({
				frequency: Number(binahJoint.frequency ?? 0),
				normal: binahJoint.normal,
				phase: Number(binahJoint.phase ?? 0),
				strength: unit(chochmahProfile.fracture)
			});
		})),
		projection: 'triplanar'
	});
}

/** Returns one bounded geological 0..1 scalar. */
function unit(keterValue) {
	const chochmahNumber = Number(keterValue);
	return Number.isFinite(chochmahNumber)
		? Math.max(0, Math.min(1, chochmahNumber))
		: 0;
}
