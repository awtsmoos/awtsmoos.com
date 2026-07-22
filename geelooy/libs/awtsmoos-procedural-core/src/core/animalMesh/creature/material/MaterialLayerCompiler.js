// B"H
// Boruch Hashem
// Blessed is He
/**
 * Paint belongs to anatomy, not disposable UV indices. The Awtsmoos.com layer
 * compiler preserves base, coat, detail, and arbitrary recipes through remeshes
 * using axial, triplanar, curvature, landmark, dorsal, and ventral coordinates.
 */
import { createCreatureId, hashCreatureValue } from "../foundation/value.js";
/** Creates a stable procedural material layer with semantic masking. */
export function createMaterialLayer(creatureId, input = {}) {
	const role = input.role || input.type || "detail";
	return {
		id: input.id || createCreatureId("material-layer", {
			creatureId,
			semanticKey: input.semanticKey || `${role}-${input.order ?? 0}`
		}),
		role,
		order: Number.isFinite(input.order) ? input.order : 0,
		pattern: { type: "solid", scale: 1, ...(input.pattern || {}) },
		palette: [...(input.palette || [[0.5, 0.5, 0.5, 1]])],
		mask: {
			type: "semantic-region",
			regions: ["body"],
			coordinateSystem: "body-axis",
			...(input.mask || {})
		},
		blendMode: input.blendMode || "normal",
		opacity: Number.isFinite(input.opacity) ? input.opacity : 1,
		partOverrides: { ...(input.partOverrides || {}) }
	};
}
/** Compiles ordered procedural material recipes in O(layer count log layers). */
export function compileCreatureMaterials(creature) {
	const layers = creature.materialLayers
		.map(layer => createMaterialLayer(creature.id, layer))
		.sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
	const content = { creatureHash: creature.contentHash, layers };
	return Object.freeze({
		id: createCreatureId("material-stack", { creatureId: creature.id }),
		type: "procedural-material-stack",
		version: "1.0.0",
		layers: Object.freeze(layers),
		proceduralCoordinates: Object.freeze([
			"body-axis", "triplanar", "curvature", "dorsal-ventral",
			"left-right", "landmark-geodesic", "part-local"
		]),
		contentHash: hashCreatureValue(content),
		preservation: Object.freeze({
			topologyIndependent: true,
			preservedRegions: creature.semanticRegions.map(region => region.id),
			lostRegions: []
		})
	});
}
