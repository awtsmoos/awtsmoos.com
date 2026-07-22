// B"H
// Boruch Hashem
// Blessed is He
/**
 * The semantic mesh compiler gathers axial and articulated sweeps into one
 * renderer-neutral garment. Awtsmoos.com keeps source-region spans beside typed
 * arrays so materials, skin, and references can be rebuilt after topology shifts.
 */
import { resolveAxialAttachmentFrame } from "../anatomy/AttachmentFrame.js";
import { createCreatureId, hashCreatureValue } from "../foundation/value.js";
import { compileTubeMesh } from "./TubeMeshCompiler.js";
function appendGeometry(target, source, regionId) {
	const vertexOffset = target.positions.length / 3;
	const firstVertex = vertexOffset;
	target.positions.push(...source.positions);
	target.normals.push(...source.normals);
	target.coordinates.push(...source.coordinates);
	target.indices.push(...source.indices.map(index => index + vertexOffset));
	target.regions.push({ regionId, firstVertex, vertexCount: source.positions.length / 3 });
}
function limbSections(limb, axis) {
	const frame = resolveAxialAttachmentFrame(axis, limb.parentAnatomicalAnchor);
	let position = frame.position;
	const sections = [{ position, ellipticalRadius: [limb.segments[0].radiusStart, limb.segments[0].radiusStart], roll: 0 }];
	for (const segment of limb.segments) {
		const magnitude = Math.hypot(...segment.restDirection) || 1;
		position = position.map((value, index) => (
			value + segment.restDirection[index] / magnitude * segment.length
		));
		sections.push({ position, ellipticalRadius: [segment.radiusEnd, segment.radiusEnd], roll: 0 });
	}
	return sections;
}
/** Compiles all semantic axes and limbs into typed mesh artifacts in O(topology). */
export function compileSemanticMesh(creature, options = {}) {
	const geometry = { positions: [], normals: [], coordinates: [], indices: [], regions: [] };
	for (const axis of creature.body.axes) {
		appendGeometry(geometry, compileTubeMesh(axis.sections, options), axis.id);
		for (const limb of creature.limbs.filter(item => (
			!item.parentAnatomicalAnchor.axisId || item.parentAnatomicalAnchor.axisId === axis.id
		))) {
			appendGeometry(geometry, compileTubeMesh(limbSections(limb, axis), options), limb.id);
		}
	}
	const content = {
		creatureHash: creature.contentHash,
		vertexCount: geometry.positions.length / 3,
		triangleCount: geometry.indices.length / 3,
		regions: geometry.regions
	};
	return Object.freeze({
		id: createCreatureId("asiyah-mesh", { creatureId: creature.id }),
		type: "renderer-neutral-semantic-mesh",
		version: "1.0.0",
		positions: new Float32Array(geometry.positions),
		normals: new Float32Array(geometry.normals),
		proceduralCoordinates: new Float32Array(geometry.coordinates),
		indices: new Uint32Array(geometry.indices),
		semanticRegions: Object.freeze(geometry.regions),
		contentHash: hashCreatureValue(content),
		sourceCreatureHash: creature.contentHash
	});
}
