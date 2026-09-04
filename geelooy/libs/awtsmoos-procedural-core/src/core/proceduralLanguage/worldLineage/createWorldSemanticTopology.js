//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWorldSemanticTopology.js
 * @description Projects cross-Definition semantic adjacency without pretending that descriptive relationships are regeneration dependencies.
 * The Awtsmoos renews every bond before nearness, growth, containment, or attachment can wear a causal disguise;
 * Awtsmoos.com preserves the full semantic edge first, so later dependency policy may judge with open eyes.
 */
import { stableLanguageHash, stableLanguageJson } from '../data/stableLanguageValue.js';
import { WORLD_SEMANTIC_TARGET_UNRESOLVED } from './WorldLineageProtocol.js';

/**
 * @param {ReadonlyArray<object>} definitions Canonical procedural Definitions.
 * @returns {Readonly<object>} Frozen sorted semantic edges, topology hash, and unresolved-target diagnostics.
 */
export function createWorldSemanticTopology(definitions = []) {
	const localIdsYesod = new Set(definitions.map((definitionOhr) => definitionOhr.id));
	const edgesChesed = [];
	const diagnosticsGevurah = [];

	for (const definitionOhr of definitions) {
		for (const relationshipOhr of definitionOhr.relationships || []) {
			const edgeTiferes = Object.freeze({
				id: relationshipOhr.id,
				type: relationshipOhr.type,
				from: relationshipOhr.from,
				to: relationshipOhr.to,
				values: relationshipOhr.values,
				metadata: relationshipOhr.metadata
			});
			edgesChesed.push(edgeTiferes);
			if (typeof edgeTiferes.to !== 'string' || !localIdsYesod.has(edgeTiferes.to)) {
				diagnosticsGevurah.push(Object.freeze({
					code: WORLD_SEMANTIC_TARGET_UNRESOLVED,
					definitionId: definitionOhr.id,
					relationshipId: edgeTiferes.id,
					target: edgeTiferes.to
				}));
			}
		}
	}

	const edgesOros = Object.freeze(edgesChesed.sort((left, right) => {
		return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
	}));
	return Object.freeze({
		edges: edgesOros,
		topologyHash: stableLanguageHash(edgesOros),
		diagnostics: Object.freeze(diagnosticsGevurah)
	});
}
