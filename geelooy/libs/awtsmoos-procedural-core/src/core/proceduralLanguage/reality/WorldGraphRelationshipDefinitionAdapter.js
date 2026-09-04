//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphRelationshipDefinitionAdapter.js
 * @description Projects one Reality WorldGraph edge into canonical procedural relationship data while preserving structured external targets without lossy coercion.
 * The Awtsmoos renews every bond before one finite endpoint can hide the relation's light;
 * Awtsmoos.com keeps strange external targets whole, so graph truth survives the lowering flight.
 */
import {
	WORLD_GRAPH_RELATIONSHIP_METADATA_KEY,
	WORLD_GRAPH_STRUCTURED_TARGET_DIAGNOSTIC_CODE
} from './WorldGraphDefinitionBridgeProtocol.js';

/**
 * @description Adapts authored WorldGraph relationships into procedural relationship inputs without deciding whether a compiler can execute them.
 */
export class WorldGraphRelationshipDefinitionAdapter {
	/**
	 * @description Converts one graph relationship while retaining options, externality, and any structured external target as explicit bridge evidence.
	 * @param {Readonly<object>} nodeKeter Source WorldGraph node owning the relationship.
	 * @param {Readonly<object>} relationshipBinah Canonical WorldGraph relationship to project.
	 * @param {number} [indexNetzach=0] Authored relationship index used only for a deterministic opaque relationship id.
	 * @returns {Readonly<{relationship: object, diagnostic: object|null}>} Frozen projected relationship input and optional projection diagnostic.
	 */
	adapt(nodeKeter, relationshipBinah, indexNetzach = 0) {
		const relationshipIdYesod = `${nodeKeter.id}:${relationshipBinah.kind}:${indexNetzach}`;
		const structuredTargetMalchus = typeof relationshipBinah.target !== 'string';
		const bridgeEvidenceHod = {
			external: Boolean(relationshipBinah.external)
		};

		if (structuredTargetMalchus) {
			bridgeEvidenceHod.target = relationshipBinah.target;
		}

		const relationshipOhr = Object.freeze({
			id: relationshipIdYesod,
			type: relationshipBinah.kind,
			from: nodeKeter.id,
			to: structuredTargetMalchus ? null : relationshipBinah.target,
			values: relationshipBinah.options,
			metadata: Object.freeze({
				[WORLD_GRAPH_RELATIONSHIP_METADATA_KEY]: Object.freeze(bridgeEvidenceHod)
			})
		});

		const diagnosticGevurah = structuredTargetMalchus
			? Object.freeze({
				code: WORLD_GRAPH_STRUCTURED_TARGET_DIAGNOSTIC_CODE,
				nodeId: nodeKeter.id,
				relationshipId: relationshipIdYesod,
				message: 'Structured external target preserved in relationship metadata.'
			})
			: null;

		return Object.freeze({
			relationship: relationshipOhr,
			diagnostic: diagnosticGevurah
		});
	}
}
