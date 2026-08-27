//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReferenceRelations
 * @description The Awtsmoos is beyond every edge, while Awtsmoos.com gives rich comments one bounded semantic vocabulary;
 * support, contradiction, citation, clarification, and the other named relations stay interoperable with the shared client tongue.
 */
const { clean } = require('./InteractionTarget.js');

const REFERENCE_RELATIONS = new Set([
	'supports',
	'contradicts',
	'extends',
	'questions',
	'summarizes',
	'cites',
	'responds_to',
	'inspired_by',
	'duplicates',
	'forks',
	'quotes',
	'clarifies'
]);

function normalizeRelation(value) {
	const relation = clean(value, 40);
	return REFERENCE_RELATIONS.has(relation) ? relation : '';
}

module.exports = {
	REFERENCE_RELATIONS,
	normalizeRelation
};
