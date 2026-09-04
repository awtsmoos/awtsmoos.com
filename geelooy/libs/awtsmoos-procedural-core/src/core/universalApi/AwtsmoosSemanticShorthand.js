//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosSemanticShorthand.js
 * @description Expands ergonomic string traits, relationships, and behaviors into Definition-compatible portable descriptors while leaving structured authored objects untouched.
 * The Awtsmoos renews a terse human word before canonical semantic vessels receive its finite form;
 * Awtsmoos.com lets shorthand remain a doorway only, never a second language whose hidden defaults could rewrite the storm.
 */
export function expandAwtsmoosSemanticShorthand(source = {}) {
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		return source;
	}
	return {
		...source,
		...(Array.isArray(source.traits) ? {traits: source.traits.map(expandTrait)} : {}),
		...(Array.isArray(source.relationships) ? {relationships: source.relationships.map(expandRelationship)} : {}),
		...(Array.isArray(source.behaviors) ? {behaviors: source.behaviors.map(expandBehavior)} : {})
	};
}

function expandTrait(value) {
	if (typeof value !== 'string') return value;
	return {id: value, kind: value};
}

function expandRelationship(value) {
	if (typeof value !== 'string') return value;
	return {type: value};
}

function expandBehavior(value) {
	if (typeof value !== 'string') return value;
	return {id: value, kind: value};
}
