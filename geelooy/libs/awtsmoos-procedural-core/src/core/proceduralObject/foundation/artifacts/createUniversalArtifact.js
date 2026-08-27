// B"H

import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";
import { normalizeResourceUsage } from "../budgets/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { assertStableId, createStableId } from "./createStableId.js";

const SCHEMA_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function assertRevision(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new RangeError(`${label} must be a non-negative integer.`);
	}
	return value;
}

function normalizeDiagnostics(values) {
	if (!Array.isArray(values)) throw new TypeError("Artifact diagnostics must be an array.");
	return Object.freeze(values.map(createDiagnostic));
}

/**
 * Creates an immutable renderer-neutral artifact with distinct logical identity,
 * exact content identity, revision lineage, provenance, diagnostics, and usage.
 */
export function createUniversalArtifact(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Universal artifact input must be an object.");
	}
	if (typeof input.schema !== "string" || !SCHEMA_PATTERN.test(input.schema)) {
		throw new TypeError("Artifact schema must be a namespaced machine identifier.");
	}
	if (typeof input.schemaVersion !== "string" || !VERSION_PATTERN.test(input.schemaVersion)) {
		throw new TypeError("Artifact schemaVersion must be semantic version text.");
	}
	const revision = assertRevision(input.revision ?? 0, "Artifact revision");
	const parentRevision = input.parentRevision == null
		? null
		: assertRevision(input.parentRevision, "Artifact parentRevision");
	if (parentRevision != null && parentRevision >= revision) {
		throw new RangeError("Artifact parentRevision must precede revision.");
	}
	const payload = normalizeCanonicalValue(input.payload ?? null);
	const provenance = normalizeCanonicalValue(input.provenance ?? {});
	const metadata = normalizeCanonicalValue(input.metadata ?? {});
	const contentHash = hashCanonicalValue({
		schema: input.schema, schemaVersion: input.schemaVersion,
		payload, provenance, metadata
	});
	const id = input.id == null
		? createStableId(input.schema, input.identitySeed ?? contentHash)
		: assertStableId(input.id, "Artifact id");
	return Object.freeze({
		artifactSchema: "awtsmoos.universal-artifact",
		id,
		schema: input.schema,
		schemaVersion: input.schemaVersion,
		revision,
		parentRevision,
		contentHash,
		payload,
		provenance,
		metadata,
		diagnostics: normalizeDiagnostics(input.diagnostics ?? []),
		resourceUsage: normalizeResourceUsage(input.resourceUsage ?? {})
	});
}
