// B"H

import { createDiagnostic } from "../diagnostics/index.js";
import { assertStableId } from "./createStableId.js";

const HASH_PATTERN = /^[a-z0-9-]+:[0-9a-f]+$/i;
const KIND_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

function normalizePath(path) {
	if (!Array.isArray(path) || path.some(segment => (
		typeof segment !== "string"
		&& !(Number.isInteger(segment) && segment >= 0)
	))) {
		throw new TypeError("Artifact reference path must contain strings or non-negative integers.");
	}
	return Object.freeze([...path]);
}

/** Creates an immutable exact-or-logical reference into a universal artifact. */
export function createArtifactReference(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Artifact reference input must be an object.");
	}
	const revision = input.revision ?? null;
	if (revision != null && (!Number.isInteger(revision) || revision < 0)) {
		throw new RangeError("Artifact reference revision must be null or a non-negative integer.");
	}
	if (input.contentHash != null && !HASH_PATTERN.test(input.contentHash)) {
		throw new TypeError("Artifact reference contentHash is malformed.");
	}
	const kind = input.kind ?? "artifact";
	if (typeof kind !== "string" || !KIND_PATTERN.test(kind)) {
		throw new TypeError("Artifact reference kind must be a machine identifier.");
	}
	return Object.freeze({
		artifactId: assertStableId(input.artifactId, "Reference artifactId"),
		revision,
		contentHash: input.contentHash ?? null,
		kind,
		path: normalizePath(input.path ?? []),
		expectedSchema: input.expectedSchema ?? null
	});
}

function failure(code, message, reference, metadata = {}) {
	return Object.freeze({
		ok: false,
		diagnostic: createDiagnostic({ code, message, path: reference.path, metadata })
	});
}

/** Resolves a reference without silently accepting stale revisions or hashes. */
export function resolveArtifactReference(artifact, referenceInput) {
	const reference = createArtifactReference(referenceInput);
	if (!artifact || artifact.id !== reference.artifactId) {
		return failure("REFERENCE.ARTIFACT_MISSING", "Referenced artifact is unavailable.", reference);
	}
	if (reference.revision != null && artifact.revision !== reference.revision) {
		return failure("REFERENCE.STALE_REVISION", "Referenced revision is stale.", reference, { actual: artifact.revision, expected: reference.revision });
	}
	if (reference.contentHash != null && artifact.contentHash !== reference.contentHash) {
		return failure("REFERENCE.HASH_MISMATCH", "Referenced content hash does not match.", reference);
	}
	if (reference.expectedSchema != null && artifact.schema !== reference.expectedSchema) {
		return failure("REFERENCE.SCHEMA_MISMATCH", "Referenced artifact schema does not match.", reference);
	}
	let value = artifact;
	for (const segment of reference.path) {
		if (value == null || !Object.hasOwn(value, segment)) {
			return failure("REFERENCE.PATH_MISSING", "Referenced path does not exist.", reference);
		}
		value = value[segment];
	}
	return Object.freeze({ ok: true, reference, value });
}
