// B"H
// Boruch Hashem
// Blessed is He
/**
 * A catalog part is a recipe for form and function, never merely a frozen mesh.
 * The Awtsmoos permits an eye, horn, mouth, fin, or claw to awaken wherever its
 * Awtsmoos.com attachment contract remains anatomically valid.
 */
import { createCreatureId, finiteCreatureNumber } from "../foundation/value.js";
export const CREATURE_PART_DEFINITIONS = Object.freeze({
	"part.eye.round": Object.freeze({ category: "eye", geometryRecipe: "ellipsoid", rigContribution: "eye-control", capabilities: ["vision"], defaults: { scale: [0.16, 0.12, 0.16] } }),
	"part.mouth.simple": Object.freeze({ category: "mouth", geometryRecipe: "capsule", rigContribution: "jaw", capabilities: ["bite"], defaults: { scale: [0.28, 0.12, 0.1] } }),
	"part.foot.three-toed": Object.freeze({ category: "foot", geometryRecipe: "ellipsoid", rigContribution: "endpoint", capabilities: ["contact", "traction"], defaults: { scale: [0.22, 0.32, 0.1] } }),
	"part.wing.membrane": Object.freeze({ category: "wing", geometryRecipe: "loft", rigContribution: "wing-chain", capabilities: ["flight"], defaults: { scale: [0.4, 0.8, 0.08] } }),
	"part.fin.simple": Object.freeze({ category: "fin", geometryRecipe: "ellipsoid", rigContribution: "fin-control", capabilities: ["swimming"], defaults: { scale: [0.08, 0.35, 0.24] } })
});
/** Creates a stable semantic part instance and attachment contract. */
export function createPartInstance(creatureId, input = {}) {
	const definitionId = input.definitionId || input.partDefinitionId;
	const definition = CREATURE_PART_DEFINITIONS[definitionId] || {
		category: input.category || "decorative",
		geometryRecipe: input.geometryRecipe || "ellipsoid",
		rigContribution: input.rigContribution || null,
		capabilities: input.capabilities || [],
		defaults: { scale: [0.15, 0.15, 0.15] }
	};
	const semanticKey = input.semanticKey || `${definitionId || definition.category}-${input.side || "center"}-${input.radialIndex ?? 0}`;
	return {
		id: input.id || createCreatureId("part-instance", { creatureId, semanticKey }),
		definitionId: definitionId || `custom.${definition.category}`,
		definitionVersion: input.definitionVersion || "1.0.0",
		category: definition.category,
		geometryRecipe: definition.geometryRecipe,
		parameters: { ...(definition.defaults || {}), ...(input.parameters || {}) },
		attachment: {
			axisId: input.attachment?.axisId || null,
			axialPosition: finiteCreatureNumber(input.attachment?.axialPosition, 0.75),
			angularPosition: finiteCreatureNumber(input.attachment?.angularPosition, 0),
			radialOffset: finiteCreatureNumber(input.attachment?.radialOffset, 1),
			landmark: input.attachment?.landmark || null,
			limbSegmentId: input.attachment?.limbSegmentId || null,
			partSocket: input.attachment?.partSocket || null,
			surfaceAnchorId: input.attachment?.surfaceAnchorId || null
		},
		transform: { rotation: [0, 0, 0], scale: [1, 1, 1], ...(input.transform || {}) },
		side: input.side || "center",
		radialIndex: input.radialIndex ?? null,
		rigContribution: definition.rigContribution,
		capabilities: [...definition.capabilities],
		materialRegion: input.materialRegion || definition.category,
		metadata: { ...(input.metadata || {}) }
	};
}
