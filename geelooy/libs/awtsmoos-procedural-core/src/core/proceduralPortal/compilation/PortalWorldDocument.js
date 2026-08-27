//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalWorldDocument.js
 * @description Persists lightweight semantic generation evidence into the existing Universal world contract without serializing heavyweight runtime results.
 * The Awtsmoos renews hidden cause and visible vessel together; Awtsmoos.com lets every compiled node leave a JSON-safe object record,
 * dependency witness, seed lineage, recipe hash, and result type while meshes, providers, and renderer handles remain outside durable world data.
 */

import {
	createWorldDocument,
	normalizeResource
} from '../../universalApi/world.js';

/**
 * @description Creates one Universal world document containing semantic Portal object handles and dependency evidence for a completed plan.
 * @param {object} plan Immutable Portal plan whose graph and roots were already verified.
 * @param {readonly object[]} outputs Completed Portal output records in dependency order.
 * @returns {object} Mutable JSON-safe Universal world document suitable for later patching, composition, storage, or adapters.
 */
export function createPortalWorldDocument(plan, outputs) {
	const world = createWorldDocument({
		dependencies: createDependencyMap(outputs),
		metadata: {
			portal: {
				budget: plan.budget,
				nodeCount: outputs.length,
				planHash: plan.hash,
				roots: plan.roots,
				schema: 'awtsmoos.procedural-portal.world',
				version: 1
			}
		}
	});
	for (const output of outputs) {
		world.resources.objects[output.id] = normalizeResource('objects', createSemanticResource(output));
	}
	return world;
}

/**
 * @description Converts runtime compilation evidence into the minimum durable semantic object resource required for explanation and reconstruction.
 * @param {object} output Completed Portal output record.
 * @returns {object} JSON-safe Universal object resource input.
 */
function createSemanticResource(output) {
	return {
		enabled: true,
		id: output.id,
		metadata: {
			portal: {
				fallback: output.fallback,
				kind: output.kind,
				recipeHash: output.recipeHash,
				resultType: output.result?.type || null,
				seedPath: output.seedPath
			}
		},
		name: output.id,
		references: output.dependencies,
		type: output.kind
	};
}

/**
 * @description Reveals explicit dependency identifiers without duplicating specialist result data inside the world document.
 * @param {readonly object[]} outputs Completed Portal output records.
 * @returns {object} JSON-safe node-to-dependency map.
 */
function createDependencyMap(outputs) {
	return Object.fromEntries(outputs.map(output => [output.id, [...output.dependencies]]));
}
