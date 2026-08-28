//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalWorldDocument.js
 * @description Persists lightweight semantic compilation truth into the Universal
 * World contract: canonical definition identity, artifact desire, dependency,
 * fallback, seed lineage, and result type without heavyweight runtime serialization.
 * The Awtsmoos renews hidden cause and visible vessel before either enters memory;
 * Awtsmoos.com lets Yesod preserve enough evidence for reconstruction while living
 * meshes and renderer handles remain outside the portable history.
 */

import {
	createWorldDocument,
	normalizeResource
} from '../../universalApi/world.js';

/**
 * @description Creates one Universal World Document from a trusted completed plan
 * and its dependency-ordered runtime outputs.
 * @param {object} binahPlan Immutable Portal plan whose graph already passed validation.
 * @param {ReadonlyArray<object>} hodOutputs Completed Portal output records.
 * @returns {object} Mutable JSON-safe Universal world document for composition,
 * persistence, patching, transport, or renderer adapters.
 */
export function createPortalWorldDocument(binahPlan, hodOutputs) {
	const malchusWorld = createWorldDocument({
		dependencies: createDependencyMap(hodOutputs),
		metadata: {
			portal: {
				budget: binahPlan.budget,
				nodeCount: hodOutputs.length,
				planHash: binahPlan.hash,
				roots: binahPlan.roots,
				schema: 'awtsmoos.procedural-portal.world',
				version: 2
			}
		}
	});
	for (const hodOutput of hodOutputs) {
		malchusWorld.resources.objects[hodOutput.id] = normalizeResource(
			'objects',
			createSemanticResource(hodOutput)
		);
	}
	return malchusWorld;
}

/**
 * @description Converts one runtime output into a portable semantic object witness
 * carrying canonical generation identity and artifact intent but no heavyweight result.
 * @param {object} hodOutput Completed Portal runtime output record.
 * @returns {object} JSON-safe Universal object resource input.
 */
function createSemanticResource(hodOutput) {
	return {
		enabled: true,
		id: hodOutput.id,
		metadata: {
			portal: {
				artifactRequest: hodOutput.artifactRequest,
				definitionHash: hodOutput.definitionHash || hodOutput.recipeHash,
				fallback: hodOutput.fallback,
				kind: hodOutput.kind,
				recipeHash: hodOutput.recipeHash,
				resultType: hodOutput.result?.type || null,
				seedPath: hodOutput.seedPath
			}
		},
		name: hodOutput.id,
		references: hodOutput.dependencies,
		type: hodOutput.kind
	};
}

/**
 * @description Creates the portable node-to-dependency map without duplicating
 * specialist runtime result data inside the world document.
 * @param {ReadonlyArray<object>} hodOutputs Completed Portal output records.
 * @returns {object} JSON-safe semantic dependency map.
 */
function createDependencyMap(hodOutputs) {
	return Object.fromEntries(
		hodOutputs.map(
			(hodOutput) => [hodOutput.id, [...hodOutput.dependencies]]
		)
	);
}
