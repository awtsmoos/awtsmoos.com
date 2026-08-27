// B"H

import {
	assertStableId,
	createStableId
} from "../../../foundation/artifacts/index.js";
import {
	hashCanonicalValue,
	normalizeCanonicalValue
} from "../../../foundation/canonical/index.js";
import { assertIndexedTriangleGeometry } from "../triangleGeometry.js";
import { deriveTopologyEdges } from "./deriveTopologyEdges.js";
import {
	TOPOLOGY_IDENTITY_SCHEMA,
	assertTopologyRevision
} from "./identityContract.js";

function normalizeElementIds(values, count, namespace, topologyId) {
	if (values != null) {
		if (!Array.isArray(values) || values.length !== count) {
			throw new RangeError(`${namespace} ids must match topology count.`);
		}
		const ids = values.map(value => assertStableId(value, `${namespace} id`));
		if (new Set(ids).size !== ids.length) throw new Error(`${namespace} ids must be unique.`);
		return Object.freeze(ids);
	}
	return Object.freeze(Array.from({ length: count }, (_, index) => (
		createStableId(namespace, { topologyId, index })
	)));
}

/**
 * Binds persistent element identities to one exact immutable geometry revision.
 * The Awtsmoos separates the enduring name from the temporary numeric seat.
 */
export function createTopologyIdentityArtifact(geometryInput, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const geometryHash = hashCanonicalValue(geometry);
	const revision = assertTopologyRevision(options.revision ?? 0);
	const parentRevision = options.parentRevision
		?? (revision === 0 ? null : revision - 1);
	if (parentRevision != null) {
		assertTopologyRevision(parentRevision, "Topology parent revision");
		if (parentRevision >= revision) throw new RangeError("Topology parent revision must precede revision.");
	}
	const id = options.id == null
		? createStableId("topology", {
			geometryId: geometry.id,
			identitySeed: options.identitySeed ?? geometryHash
		})
		: assertStableId(options.id, "Topology identity id");
	const vertexIds = normalizeElementIds(
		options.vertexIds,
		geometry.attributes.position.count,
		"vertex",
		id
	);
	const faceIds = normalizeElementIds(
		options.faceIds,
		geometry.indices.array.length / 3,
		"face",
		id
	);
	const edges = deriveTopologyEdges(geometry, vertexIds, faceIds, {
		edgeIdsByKey: options.edgeIdsByKey,
		identitySeed: id
	});
	const content = Object.freeze({
		geometry: Object.freeze({
			id: geometry.id,
			topology: geometry.topology,
			contentHash: geometryHash
		}),
		revision,
		parentRevision,
		vertexIds,
		faceIds,
		edges,
		metadata: normalizeCanonicalValue(options.metadata ?? {})
	});
	return Object.freeze({
		schema: TOPOLOGY_IDENTITY_SCHEMA,
		id,
		contentHash: hashCanonicalValue(content),
		...content
	});
}
