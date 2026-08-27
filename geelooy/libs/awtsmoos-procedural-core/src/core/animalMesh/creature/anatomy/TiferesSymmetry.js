// B"H
// Boruch Hashem
// Blessed is He
/**
 * Tiferes balances likeness and freedom. Awtsmoos.com stores bilateral, radial,
 * rotational, repeated, and custom relationships as living contracts, so one
 * member may vary within bounds without destroying the shared semantic source.
 */
import { createCreatureId, finiteCreatureNumber } from "../foundation/value.js";
/** Creates a persistent symmetry relationship in O(member count). */
export function createSymmetryGroup(creatureId, input = {}) {
	const type = input.type || "bilateral";
	const members = [...(input.members || [])];
	const count = Math.max(1, Math.floor(finiteCreatureNumber(input.count, members.length || 2)));
	return {
		id: input.id || createCreatureId("symmetry-group", {
			creatureId,
			type,
			semanticKey: input.semanticKey || members.join("|")
		}),
		type,
		members,
		axis: input.axis || [0, 0, 1],
		plane: input.plane || "X=0",
		count,
		angleStep: finiteCreatureNumber(input.angleStep, type === "radial" ? Math.PI * 2 / count : Math.PI),
		linkedProperties: [...(input.linkedProperties || ["geometry", "transform", "parameters"])],
		unlinkedProperties: [...(input.unlinkedProperties || [])],
		variationBounds: { ...(input.variationBounds || {}) },
		active: input.active !== false,
		metadata: { ...(input.metadata || {}) }
	};
}
