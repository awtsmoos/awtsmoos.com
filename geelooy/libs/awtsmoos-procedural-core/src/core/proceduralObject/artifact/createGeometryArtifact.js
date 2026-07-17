// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_TOPOLOGY_MODES
} from "../constants/proceduralObjectContract.js";
import {
	createAttributeArtifact
} from "./createAttributeArtifact.js";
import {
	createIndexArtifact
} from "./createIndexArtifact.js";
import {
	assertGeometryInvariants
} from "./geometryInvariants.js";

function normalizeAttributes(attributes = {}) {
	const normalized = {};
	for (const [name, declaration] of Object.entries(attributes)) {
		if (!name || typeof name !== "string") {
			throw new Error('B"H | Attribute names must be non-empty strings.');
		}
		normalized[name] = createAttributeArtifact(declaration);
	}
	return Object.freeze(normalized);
}

function normalizeMorphTargets(targets = {}) {
	const normalized = {};
	for (const [name, attributes] of Object.entries(targets)) {
		normalized[name] = normalizeAttributes(attributes);
	}
	return Object.freeze(normalized);
}

/**
 * Creates the universal Awtsmoos geometry vessel.
 *
 * @param {object} input Geometry declaration.
 * @returns {object} Frozen renderer-neutral artifact.
 */
export function createGeometryArtifact(input = {}) {
	const topology = input.topology || "triangles";
	if (!PROCEDURAL_TOPOLOGY_MODES.includes(topology)) {
		throw new Error(`B"H | Unsupported topology mode: ${topology}`);
	}
	const artifact = {
		id: input.id || "geometry",
		topology,
		attributes: normalizeAttributes(input.attributes),
		indices: createIndexArtifact(input.indices),
		groups: Object.freeze([...(input.groups || [])].map(freezeRecord)),
		drawRange: Object.freeze({
			start: input.drawRange?.start ?? input.draw_range?.start ?? 0,
			count: input.drawRange?.count ?? input.draw_range?.count ?? null
		}),
		morphTargets: normalizeMorphTargets(
			input.morphTargets || input.morph_targets
		),
		morphTargetsRelative: input.morphTargetsRelative === true
			|| input.morph_targets_relative === true,
		bounds: input.bounds ? freezeRecord(input.bounds) : null,
		materialSlots: Object.freeze([
			...(input.materialSlots || input.material_slots || [])
		]),
		instanceCount: input.instanceCount ?? input.instance_count ?? null,
		primitiveRestart: input.primitiveRestart === true
			|| input.primitive_restart === true,
		metadata: freezeRecord(input.metadata)
	};
	const position = artifact.attributes.position;
	if (position && position.itemSize < 2) {
		throw new Error('B"H | Position attributes require at least two components.');
	}
	assertGeometryInvariants(artifact);
	return Object.freeze(artifact);
}

/**
 * Returns the authoritative vertex count from the position attribute.
 *
 * @param {object} geometry Geometry artifact.
 * @returns {number} Vertex count.
 */
export function getGeometryVertexCount(geometry) {
	return geometry.attributes?.position?.count || 0;
}

function freezeRecord(value = {}) {
	return Object.freeze({...value});
}
