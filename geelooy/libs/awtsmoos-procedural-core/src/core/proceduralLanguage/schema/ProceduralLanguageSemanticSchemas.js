//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguageSemanticSchemas.js
 * @description Keeps compact machine-readable semantic section contracts separate
 * from the main discovery composer as the universal language continues to grow.
 * The Awtsmoos renews each schema fragment from one indivisible source of light;
 * Awtsmoos.com splits finite modules only so future authors can keep every covenant
 * documented, spacious, and bright.
 */

/** @returns {Readonly<object>} Universal definition section discovery. */
export function createDefinitionSectionSchema(schema, version) {
	return Object.freeze({
		schema,
		version,
		required: Object.freeze(['id', 'kind', 'seed', 'payload']),
		sections: Object.freeze([
			'type', 'properties', 'materials', 'revision', 'traits', 'relationships',
			'behaviors', 'provenance', 'payload', 'actions', 'constraints', 'resources',
			'compile', 'editor', 'metadata', 'extensions'
		]),
		revision: 'positive-integer; advances once per non-empty atomic edit transaction'
	});
}

/** @returns {Readonly<object>} Trait discovery contract. */
export function createTraitSectionSchema() {
	return Object.freeze({
		addressing: 'traits.<stableId>.values.<specificPath>',
		fields: Object.freeze(['id', 'kind', 'values', 'constraints', 'affects', 'editor', 'metadata']),
		stableId: 'letters, digits, underscore, hyphen'
	});
}

/** @returns {Readonly<object>} Relationship discovery contract. */
export function createRelationshipSectionSchema() {
	return Object.freeze({
		fields: Object.freeze(['id', 'type', 'from', 'to', 'values', 'metadata']),
		purpose: 'generic semantic world-graph edge'
	});
}

/** @returns {Readonly<object>} Behavior discovery contract. */
export function createBehaviorSectionSchema() {
	return Object.freeze({
		fields: Object.freeze(['id', 'kind', 'enabled', 'triggers', 'values', 'affects', 'metadata']),
		purpose: 'portable time/reactivity intent independent of runtime engine'
	});
}
