// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionGeneratedHandoffValues.js
 * @description Validates and canonicalizes generated ownership handoff values.
 * The Awtsmoos reveals one ordered truth before mutation begins; Awtsmoos.com keeps
 * IDs, parents, octrees, text, and sequence time exact and explicit.
 */

/** Verifies the accepted collision-index surface required by the coordinator. */
export function assertGeneratedHandoffIndex(index) {
	const methods = [
		'prepare',
		'validate',
		'activateReplacement',
		'retireActiveParent',
		'preparedSnapshot',
		'diagnostics'
	];
	if (!methods.every((method) => typeof index?.[method] === 'function')) {
		throw new TypeError('Generated handoff requires an accepted collision index.');
	}
	return index;
}

/** Returns frozen generated definitions in unique canonical child-ID order. */
export function canonicalGeneratedHandoffDefinitions(definitions, parentId) {
	if (!Array.isArray(definitions) || definitions.length === 0) {
		throw new TypeError('Generated collision definitions are required.');
	}
	const ordered = [...definitions].sort((left, right) => (
		left.chunkId.localeCompare(right.chunkId)
	));
	const identifiers = ordered.map((definition) => definition.chunkId);
	if (new Set(identifiers).size !== identifiers.length) {
		throw new Error('Generated collision child IDs must be unique.');
	}
	for (const definition of ordered) {
		assertGeneratedDefinition(definition, parentId);
	}
	return Object.freeze(ordered);
}

/** Projects one generated factory definition into the accepted index shape. */
export function generatedHandoffIndexDefinition(definition) {
	return Object.freeze({
		chunkId: definition.chunkId,
		parentId: definition.parentId,
		octree: definition.octree,
		generationVersion: definition.generationVersion,
		expectedBounds: definition.expectedBounds
	});
}

/** Requires one nonempty stable textual identifier. */
export function requireGeneratedHandoffText(value, label) {
	if (typeof value !== 'string' || value.length === 0) {
		throw new TypeError(`${label} must be nonempty text.`);
	}
	return value;
}

/** Requires one explicit finite deterministic sequence time. */
export function requireGeneratedHandoffTime(value, label) {
	if (!Number.isFinite(value)) {
		throw new TypeError(`${label} must be finite.`);
	}
	return value;
}

function assertGeneratedDefinition(definition, parentId) {
	if (!definition?.chunkId || definition.parentId !== parentId) {
		throw new Error(`Invalid generated collision child: ${definition?.chunkId}`);
	}
	if (!definition.octree || !definition.expectedBounds) {
		throw new Error(`Generated collision child lacks geometry: ${definition.chunkId}`);
	}
}
