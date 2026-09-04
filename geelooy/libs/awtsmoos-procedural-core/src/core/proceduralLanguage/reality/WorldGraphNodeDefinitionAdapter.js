//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphNodeDefinitionAdapter.js
 * @description Projects one canonical Reality WorldGraph node into the existing procedural Definition law while leaving graph-wide policy outside node identity.
 * The Awtsmoos renews each node before its finite kind can gather payload, seed, and relation;
 * Awtsmoos.com lets the same semantic light enter Definition without inventing a rival creation.
 */
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import {
	WORLD_GRAPH_DEFINITION_BRIDGE_ID,
	WORLD_GRAPH_DEFINITION_EXTENSION_KEY
} from './WorldGraphDefinitionBridgeProtocol.js';
import { deriveWorldGraphDefinitionSeed } from './WorldGraphDefinitionSeed.js';
import { WorldGraphRelationshipDefinitionAdapter } from './WorldGraphRelationshipDefinitionAdapter.js';

/**
 * @description Adapts node-local Reality semantics into canonical procedural Definitions while delegating edge projection to a focused relationship adapter.
 */
export class WorldGraphNodeDefinitionAdapter {
	/**
	 * @description Creates a node adapter with an injectable relationship adapter for future specialist bridge policies and isolated testing.
	 * @param {object} [optionsBinah={}] Adapter dependencies.
	 * @param {WorldGraphRelationshipDefinitionAdapter} [optionsBinah.relationshipAdapter] Relationship projection service.
	 */
	constructor({ relationshipAdapter = new WorldGraphRelationshipDefinitionAdapter() } = {}) {
		this.relationshipAdapter = relationshipAdapter;
		Object.freeze(this);
	}

	/**
	 * @description Converts one canonical graph node into a canonical procedural Definition plus factual projection diagnostics.
	 * @param {Readonly<object>} graphKeter Canonical WorldGraph document supplying root seed and protocol lineage.
	 * @param {Readonly<object>} nodeChochmah Canonical WorldGraph node whose local semantics will be projected.
	 * @returns {Readonly<{definition: object, diagnostics: ReadonlyArray<object>}>} Frozen Definition and bridge diagnostics.
	 * @throws {TypeError|RangeError} When existing Definition normalization rejects malformed semantic input.
	 */
	adapt(graphKeter, nodeChochmah) {
		const adaptedRelationsOros = nodeChochmah.relationships.map(
			(relationshipBinah, indexNetzach) => this.relationshipAdapter.adapt(
				nodeChochmah,
				relationshipBinah,
				indexNetzach
			)
		);
		const diagnosticsGevurah = Object.freeze(
			adaptedRelationsOros.map((itemOhr) => itemOhr.diagnostic).filter(Boolean)
		);
		const realityExtensionBinah = {
			capabilityRequirements: nodeChochmah.capabilityRequirements,
			domain: nodeChochmah.domain,
			profile: nodeChochmah.profile,
			provenance: nodeChochmah.provenance,
			source: nodeChochmah.source
		};

		if (nodeChochmah.seed !== null && nodeChochmah.seed !== undefined) {
			realityExtensionBinah.authoredSeed = nodeChochmah.seed;
		}

		const definitionOhr = createProceduralDefinition({
			id: nodeChochmah.id,
			kind: nodeChochmah.type,
			seed: deriveWorldGraphDefinitionSeed(graphKeter, nodeChochmah),
			payload: nodeChochmah.options,
			constraints: nodeChochmah.constraints,
			relationships: adaptedRelationsOros.map((itemOhr) => itemOhr.relationship),
			metadata: nodeChochmah.metadata,
			provenance: {
				tool: WORLD_GRAPH_DEFINITION_BRIDGE_ID,
				derivedFrom: `${graphKeter.protocol}@${graphKeter.version}:${nodeChochmah.id}`,
				metadata: {
					nodeId: nodeChochmah.id,
					sourceProtocol: graphKeter.protocol,
					sourceVersion: graphKeter.version
				}
			},
			extensions: {
				[WORLD_GRAPH_DEFINITION_EXTENSION_KEY]: realityExtensionBinah
			}
		});

		return Object.freeze({
			definition: definitionOhr,
			diagnostics: diagnosticsGevurah
		});
	}
}
