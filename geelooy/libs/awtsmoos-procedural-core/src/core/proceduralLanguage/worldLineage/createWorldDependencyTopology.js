//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWorldDependencyTopology.js
 * @description Promotes semantic edges into explicit upstream-to-dependent regeneration edges only when data-driven policy authorizes causality.
 * The Awtsmoos renews cause before consequence can flow through a finite graph's frame;
 * Awtsmoos.com leaves semantic edges untouched while explicit policy reveals which changes truly propagate by name.
 */
import { stableLanguageHash, stableLanguageJson } from '../data/stableLanguageValue.js';
import { WORLD_DEPENDENCY_DIRECTIONS, WORLD_DEPENDENCY_TARGET_UNRESOLVED } from './WorldLineageProtocol.js';

/** Creates frozen dependency topology from semantic edges and an explicit policy registry. */
export function createWorldDependencyTopology(semanticTopology, policyRegistry, definitionIds = []) {
	const localIdsYesod = new Set(definitionIds);
	const edgesByKeyHod = new Map();
	const diagnosticsGevurah = [];

	for (const semanticOhr of semanticTopology.edges || []) {
		const policyBinah = policyRegistry.resolve(semanticOhr.type);
		if (!policyBinah || policyBinah.direction === WORLD_DEPENDENCY_DIRECTIONS.NONE) {
			continue;
		}
		if (!localIdsYesod.has(semanticOhr.from) || typeof semanticOhr.to !== 'string' || !localIdsYesod.has(semanticOhr.to)) {
			diagnosticsGevurah.push(Object.freeze({
				code: WORLD_DEPENDENCY_TARGET_UNRESOLVED,
				relationshipId: semanticOhr.id,
				relationshipType: semanticOhr.type,
				from: semanticOhr.from,
				to: semanticOhr.to
			}));
			continue;
		}
		for (const edgeNetzach of promoteDependencyEdges(semanticOhr, policyBinah.direction)) {
			edgesByKeyHod.set(stableLanguageJson(edgeNetzach), edgeNetzach);
		}
	}

	const edgesOros = Object.freeze([...edgesByKeyHod.values()].sort((left, right) => {
		return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
	}));
	const dependentsMalchus = createDependentsLookup(definitionIds, edgesOros);
	const policiesChochmah = policyRegistry.describe();
	const policyHashYesod = policyRegistry.hash();
	return Object.freeze({
		policies: policiesChochmah,
		policyHash: policyHashYesod,
		edges: edgesOros,
		dependents: dependentsMalchus,
		dependencyHash: stableLanguageHash({ policies: policiesChochmah, edges: edgesOros }),
		diagnostics: Object.freeze(diagnosticsGevurah)
	});
}

/** Projects one policy into traversal-direction dependency edges. */
function promoteDependencyEdges(semanticOhr, direction) {
	const makeEdge = (from, to) => Object.freeze({
		from,
		to,
		relationshipId: semanticOhr.id,
		relationshipType: semanticOhr.type,
		policyDirection: direction
	});
	if (direction === WORLD_DEPENDENCY_DIRECTIONS.SOURCE_DEPENDS_ON_TARGET) {
		return [makeEdge(semanticOhr.to, semanticOhr.from)];
	}
	if (direction === WORLD_DEPENDENCY_DIRECTIONS.TARGET_DEPENDS_ON_SOURCE) {
		return [makeEdge(semanticOhr.from, semanticOhr.to)];
	}
	if (direction === WORLD_DEPENDENCY_DIRECTIONS.BIDIRECTIONAL && semanticOhr.from !== semanticOhr.to) {
		return [makeEdge(semanticOhr.from, semanticOhr.to), makeEdge(semanticOhr.to, semanticOhr.from)];
	}
	return [];
}

/** Builds a prototype-safe upstream-to-dependent lookup for existing traversal utilities. */
function createDependentsLookup(definitionIds, edges) {
	const lookupMalchus = Object.create(null);
	for (const id of definitionIds) {
		lookupMalchus[id] = [];
	}
	for (const edge of edges) {
		lookupMalchus[edge.from].push(edge.to);
	}
	for (const id of definitionIds) {
		lookupMalchus[id] = Object.freeze([...new Set(lookupMalchus[id])].sort());
	}
	return Object.freeze(lookupMalchus);
}
