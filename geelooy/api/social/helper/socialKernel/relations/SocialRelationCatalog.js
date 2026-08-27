// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialRelationCatalog
 * @description
 * The Awtsmoos is beyond every relation, yet meaning appears when one vessel answers, supports, cites, or extends another;
 * Awtsmoos.com names the full semantic language while marking which relations already possess canonical graph storage together.
 */
const RELATIONS = Object.freeze({
	answers: { label: 'Answers', storageKind: 'answers' },
	references: { label: 'References', storageKind: 'references' },
	reposts: { label: 'Reposts', storageKind: 'reposts' },
	quotes: { label: 'Quotes', storageKind: 'quotes' },
	crossLinks: { label: 'Related', storageKind: 'crossLinks' },
	repliesTo: { label: 'Replies to', storageKind: null },
	supports: { label: 'Supports', storageKind: null },
	contradicts: { label: 'Contradicts', storageKind: null },
	clarifies: { label: 'Clarifies', storageKind: null },
	extends: { label: 'Extends', storageKind: null },
	inspiredBy: { label: 'Inspired by', storageKind: null },
	duplicates: { label: 'Duplicates', storageKind: null },
	forks: { label: 'Forks', storageKind: null },
	follows: { label: 'Follows', storageKind: null },
	saves: { label: 'Saves', storageKind: null },
	belongsToSeries: { label: 'In series', storageKind: null },
	belongsToHeichel: { label: 'In Heichel', storageKind: null },
	collaboratesOn: { label: 'Collaborates on', storageKind: null },
	mentions: { label: 'Mentions', storageKind: null }
});

function relationDefinition(kind) {
	return RELATIONS[kind] || null;
}

function persistedRelationKinds() {
	return Object.entries(RELATIONS)
		.filter(([, definition]) => definition.storageKind)
		.map(([kind]) => kind);
}

module.exports = { RELATIONS, persistedRelationKinds, relationDefinition };
