//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DefinitionSemanticIdIndex.js
 * @description Projects one canonical definition into generic semantic-id sets so
 * compiler matching can query meaning without knowing domain nouns or descriptor
 * implementation details.
 * The Awtsmoos renews trait, relation, constraint, and behavior before an index
 * gathers their finite names;
 * Awtsmoos.com lets Daas reveal a small semantic map while the richer authored
 * definition remains untouched within its frames.
 */

/**
 * @description Builds stable sets from the authoritative identity fields already
 * used by traits, relationships, constraints, and behaviors in the language.
 * @param {Readonly<object>} tiferesDefinition Canonical procedural definition.
 * @returns {Readonly<object>} Frozen record containing semantic-id sets used only
 * for capability prerequisite matching.
 */
export function createDefinitionSemanticIdIndex(tiferesDefinition) {
	return Object.freeze({
		traits: new Set(Object.keys(tiferesDefinition.traits || {})),
		relationships: new Set(
			(tiferesDefinition.relationships || []).map(
				(item) => String(item.type || '')
			)
		),
		constraints: new Set(
			(tiferesDefinition.constraints || []).map(
				(item) => String(
					item.constraintType || item.type || item.kind || ''
				)
			)
		),
		behaviors: new Set(
			(tiferesDefinition.behaviors || []).map(
				(item) => String(item.kind || '')
			)
		)
	});
}
