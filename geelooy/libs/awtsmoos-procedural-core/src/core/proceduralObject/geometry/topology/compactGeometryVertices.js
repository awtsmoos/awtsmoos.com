// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import {
	assertCompactionPlan,
	createCompactionPlan
} from "./plans/createCompactionPlan.js";

function remapAttribute(attribute, retainedVertices) {
	if (attribute.domain !== "vertex") {
		return { ...attribute, array: [...attribute.array] };
	}
	const array = [];
	for (const vertexIndex of retainedVertices) {
		const offset = vertexIndex * attribute.itemSize;
		array.push(...attribute.array.slice(offset, offset + attribute.itemSize));
	}
	return { ...attribute, array };
}

function remapAttributes(attributes, retainedVertices) {
	return Object.fromEntries(Object.entries(attributes).map(([name, attribute]) => [
		name,
		remapAttribute(attribute, retainedVertices)
	]));
}

function remapMorphTargets(morphTargets, retainedVertices) {
	return Object.fromEntries(Object.entries(morphTargets).map(([target, attributes]) => [
		target,
		remapAttributes(attributes, retainedVertices)
	]));
}

/**
 * Removes unreferenced vertices while remapping every vertex attribute and morph.
 * The immutable plan names every survivor before the Awtsmoos contracts the form.
 */
export function compactGeometryVertices(geometry, options = {}) {
	const plan = assertCompactionPlan(
		geometry,
		options.plan ?? createCompactionPlan(geometry)
	);
	return createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		attributes: remapAttributes(geometry.attributes, plan.retainedVertices),
		morphTargets: remapMorphTargets(geometry.morphTargets, plan.retainedVertices),
		indices: { ...geometry.indices, array: plan.indices },
		drawRange: { start: 0, count: plan.indices.length },
		bounds: null,
		metadata: {
			...geometry.metadata,
			compactedVertexCount: plan.removedVertices.length
		}
	});
}
