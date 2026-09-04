//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWorldSemanticSnapshot.js
 * @description Composes existing Definition identity with separate semantic and dependency topologies into deterministic world-scale lineage evidence.
 * The Awtsmoos renews each Definition before a world can gather many identities beneath one sky;
 * Awtsmoos.com hashes meaning apart from causality, so semantic truth and regeneration policy never learn to lie.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createDefinitionIdentityReceipt } from '../definition/createDefinitionIdentityReceipt.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { WorldDependencyPolicyRegistry } from './WorldDependencyPolicyRegistry.js';
import { WORLD_SEMANTIC_SNAPSHOT_SCHEMA, WORLD_SEMANTIC_SNAPSHOT_VERSION } from './WorldLineageProtocol.js';
import { createWorldDependencyTopology } from './createWorldDependencyTopology.js';
import { createWorldSemanticTopology } from './createWorldSemanticTopology.js';

/** Creates one immutable world semantic snapshot from canonicalizable Definitions and explicit dependency policy. */
export function createWorldSemanticSnapshot(definitionInputs = [], optionsBinah = {}) {
	const policyRegistry = optionsBinah.policyRegistry || new WorldDependencyPolicyRegistry();
	const definitionsOros = definitionInputs.map((inputOhr) => createProceduralDefinition(inputOhr));
	const definitionOrderNetzach = Object.freeze(definitionsOros.map((definitionOhr) => definitionOhr.id));
	assertUniqueDefinitionIds(definitionOrderNetzach);

	const identitiesOros = Object.freeze(definitionsOros
		.map((definitionOhr) => createDefinitionIdentityReceipt(definitionOhr))
		.sort((left, right) => left.id.localeCompare(right.id)));
	const identitiesByIdYesod = Object.create(null);
	for (const identityOhr of identitiesOros) {
		identitiesByIdYesod[identityOhr.id] = identityOhr;
	}
	Object.freeze(identitiesByIdYesod);

	const semanticTiferes = createWorldSemanticTopology(definitionsOros);
	const dependencyGevurah = createWorldDependencyTopology(
		semanticTiferes,
		policyRegistry,
		definitionOrderNetzach
	);
	const semanticHashYesod = stableLanguageHash({
		identities: identitiesOros,
		edges: semanticTiferes.edges
	});
	const diagnosticsMalchus = Object.freeze([
		...semanticTiferes.diagnostics,
		...dependencyGevurah.diagnostics
	]);

	return Object.freeze({
		schema: WORLD_SEMANTIC_SNAPSHOT_SCHEMA,
		version: WORLD_SEMANTIC_SNAPSHOT_VERSION,
		definitionOrder: definitionOrderNetzach,
		identities: identitiesOros,
		identitiesById: identitiesByIdYesod,
		semanticEdges: semanticTiferes.edges,
		semanticTopologyHash: semanticTiferes.topologyHash,
		semanticHash: semanticHashYesod,
		policies: dependencyGevurah.policies,
		policyHash: dependencyGevurah.policyHash,
		dependencyEdges: dependencyGevurah.edges,
		dependents: dependencyGevurah.dependents,
		dependencyHash: dependencyGevurah.dependencyHash,
		diagnostics: diagnosticsMalchus
	});
}

/** Rejects duplicate stable ids before null-prototype lookup creation can hide conflicting Definitions. */
function assertUniqueDefinitionIds(definitionOrder) {
	const seenYesod = new Set();
	for (const id of definitionOrder) {
		if (seenYesod.has(id)) {
			throw new RangeError(`Duplicate world Definition id: ${id}`);
		}
		seenYesod.add(id);
	}
}
