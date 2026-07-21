// B"H

import {
	assertStableId,
	createArtifactReference
} from "../../../foundation/artifacts/index.js";
import { hashCanonicalValue } from "../../../foundation/canonical/index.js";
import { assertIndexedTriangleGeometry } from "../triangleGeometry.js";

export const TOPOLOGY_IDENTITY_SCHEMA = "awtsmoos.topology-identity";
export const TOPOLOGY_REMAP_SCHEMA = "awtsmoos.topology-remap";
export const TOPOLOGY_IDENTITY_DOMAINS = Object.freeze(["vertex", "edge", "face"]);

export function assertTopologyRevision(value, label = "Topology revision") {
	if (!Number.isInteger(value) || value < 0) {
		throw new RangeError(`${label} must be a non-negative integer.`);
	}
	return value;
}

export function topologyDomainIds(identity, domain) {
	if (domain === "vertex") return identity.vertexIds;
	if (domain === "face") return identity.faceIds;
	if (domain === "edge") return identity.edges.map(edge => edge.id);
	throw new TypeError(`Unsupported topology identity domain: ${domain}`);
}

export function topologyReferencesEqual(left, right) {
	return left?.artifactId === right?.artifactId
		&& left?.revision === right?.revision
		&& left?.contentHash === right?.contentHash;
}

/** Validates the immutable shape shared by topology identity consumers. */
export function assertTopologyIdentityArtifact(identity) {
	if (!identity || identity.schema !== TOPOLOGY_IDENTITY_SCHEMA) {
		throw new TypeError("Topology identity artifact is invalid.");
	}
	assertStableId(identity.id, "Topology identity id");
	assertTopologyRevision(identity.revision);
	if (!Array.isArray(identity.vertexIds) || !Array.isArray(identity.faceIds)) {
		throw new TypeError("Topology identity domains must be arrays.");
	}
	return identity;
}

export function assertTopologyRemapArtifact(remap) {
	if (!remap || remap.schema !== TOPOLOGY_REMAP_SCHEMA) {
		throw new TypeError("Topology remap artifact is invalid.");
	}
	assertStableId(remap.id, "Topology remap id");
	if (!remap.source || !remap.target || !remap.mappings) {
		throw new TypeError("Topology remap references and mappings are required.");
	}
	return remap;
}

/** Creates an exact revision reference suitable for selections and remaps. */
export function createTopologyIdentityReference(identityInput) {
	const identity = assertTopologyIdentityArtifact(identityInput);
	return createArtifactReference({
		artifactId: identity.id,
		revision: identity.revision,
		contentHash: identity.contentHash,
		kind: "topology-identity",
		expectedSchema: TOPOLOGY_IDENTITY_SCHEMA
	});
}

/** Rejects identity data bound to any geometry other than the exact input. */
export function assertTopologyIdentityMatchesGeometry(identityInput, geometryInput) {
	const identity = assertTopologyIdentityArtifact(identityInput);
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	if (identity.geometry.contentHash !== hashCanonicalValue(geometry)) {
		throw new Error("Topology identity does not match geometry content.");
	}
	if (identity.vertexIds.length !== geometry.attributes.position.count) {
		throw new Error("Topology identity vertex count does not match geometry.");
	}
	if (identity.faceIds.length !== geometry.indices.array.length / 3) {
		throw new Error("Topology identity face count does not match geometry.");
	}
	return identity;
}
