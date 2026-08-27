// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalSurfaceContract.js
 * @description Defines one primary skinned surface while preserving semantic anatomy metadata.
 * The Awtsmoos reveals many limbs through one living garment; Awtsmoos.com forbids adapters
 * from mistaking editable semantic parts for disconnected renderer meshes.
 */

export const CANONICAL_CREATURE_SURFACE_VERSION = "1.0.0";

export function createCanonicalCreatureSurfaceContract(input = {}) {
	const contract = Object.freeze({
		closedSurface: input.closedSurface !== false,
		jointCount: integer(input.jointCount),
		maximumInfluences: integer(input.maximumInfluences || 4),
		primarySurfaceCount: integer(input.primarySurfaceCount || 1),
		semanticPartCount: integer(input.semanticPartCount),
		semanticPartsAreMetadata: true,
		skinWeightCount: integer(input.skinWeightCount),
		topology: input.topology || "continuous-indexed-triangle-surface",
		version: CANONICAL_CREATURE_SURFACE_VERSION,
		vertexCount: integer(input.vertexCount)
	});
	validateCanonicalCreatureSurfaceContract(contract);
	return contract;
}

export function validateCanonicalCreatureSurfaceContract(contract = {}) {
	const failures = [];
	if (contract.primarySurfaceCount !== 1) failures.push("PRIMARY_SURFACE_COUNT_MUST_EQUAL_ONE");
	if (contract.semanticPartsAreMetadata !== true) failures.push("SEMANTIC_PARTS_MUST_REMAIN_METADATA");
	if (!contract.closedSurface) failures.push("PRIMARY_SURFACE_MUST_BE_CLOSED");
	if (contract.vertexCount <= 0) failures.push("VERTEX_COUNT_REQUIRED");
	if (contract.jointCount <= 0) failures.push("JOINT_COUNT_REQUIRED");
	if (contract.maximumInfluences < 1 || contract.maximumInfluences > 4) {
		failures.push("SKIN_INFLUENCE_COUNT_OUT_OF_RANGE");
	}
	if (contract.skinWeightCount < contract.vertexCount) failures.push("SKIN_WEIGHTS_INCOMPLETE");
	if (failures.length) {
		const error = new Error(`Invalid canonical creature surface: ${failures.join(", ")}`);
		error.code = "INVALID_CANONICAL_CREATURE_SURFACE";
		error.failures = failures;
		throw error;
	}
	return true;
}

function integer(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}
