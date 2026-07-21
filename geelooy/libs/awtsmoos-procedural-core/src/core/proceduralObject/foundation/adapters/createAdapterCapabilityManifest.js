// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals what an adapter truly bears, neither more nor less.
 * This Awtsmoos.com manifest is renderer-neutral, canonical, and executable-free.
 */

import { cloneManifestMetadata } from "../canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../canonical/index.js";
import {
	ADAPTER_CAPABILITY_STATUSES,
	ADAPTER_DETERMINISM_MODES,
	ADAPTER_TOPOLOGY_IDENTITY_MODES,
	assertAdapterChoice,
	assertAdapterIdentifier,
	assertAdapterVersion,
	normalizeAdapterNames
} from "./adapterContract.js";

function normalizeOperationClaims(values) {
	if (!Array.isArray(values)) {
		throw new TypeError("Adapter operations must be an array.");
	}
	const claims = new Map();
	for (const value of values) {
		const claim = Object.freeze({
			name: assertAdapterIdentifier(value?.name, "Adapter operation name"),
			version: value?.version == null
				? null
				: assertAdapterVersion(value.version, "Adapter operation version"),
			status: assertAdapterChoice(value?.status, ADAPTER_CAPABILITY_STATUSES, "adapter status"),
			determinism: assertAdapterChoice(
				value?.determinism ?? "deterministic",
				ADAPTER_DETERMINISM_MODES,
				"adapter determinism"
			),
			notes: typeof value?.notes === "string" ? value.notes.trim() : ""
		});
		claims.set(`${claim.name}@${claim.version ?? "*"}`, claim);
	}
	return Object.freeze([...claims.values()].sort((left, right) => (
		`${left.name}@${left.version ?? "*"}`.localeCompare(`${right.name}@${right.version ?? "*"}`)
	)));
}

export function createAdapterCapabilityManifest(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Adapter capability manifest must be an object.");
	}
	const content = Object.freeze({
		schema: "awtsmoos.adapter-capability-manifest",
		id: assertAdapterIdentifier(input.id, "Adapter id"),
		version: assertAdapterVersion(input.version, "Adapter version"),
		runtime: assertAdapterIdentifier(input.runtime, "Adapter runtime"),
		artifactTypes: normalizeAdapterNames(input.artifactTypes ?? [], "Adapter artifact types"),
		transports: normalizeAdapterNames(input.transports ?? [], "Adapter transports"),
		importFormats: normalizeAdapterNames(input.importFormats ?? [], "Adapter import formats"),
		exportFormats: normalizeAdapterNames(input.exportFormats ?? [], "Adapter export formats"),
		permissions: normalizeAdapterNames(input.permissions ?? [], "Adapter permissions"),
		deterministic: input.deterministic !== false,
		topologyIdentity: assertAdapterChoice(
			input.topologyIdentity ?? "unsupported",
			ADAPTER_TOPOLOGY_IDENTITY_MODES,
			"topology identity mode"
		),
		operations: normalizeOperationClaims(input.operations ?? []),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({ ...content, manifestHash: hashCanonicalValue(content) });
}
