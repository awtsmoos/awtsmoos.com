//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentGraphService
 * @description The Awtsmoos lets a rich comment point toward canonical entities or a plain URL without confusing their storage;
 * Awtsmoos.com persists semantic relation on the native link while graph edges remain the proven generic `references` kind.
 */
const { addGraphReference } = require('../socialGraph.js');

function nativeLink(reference) {
	return {
		kind: reference.kind,
		postId: reference.id,
		url: reference.url || '',
		heichelId: reference.heichelId,
		seriesId: reference.seriesId,
		sectionId: reference.sectionId,
		label: reference.label,
		relation: reference.relation || ''
	};
}

function commentEntity(comment) {
	return {
		type: 'comment',
		id: comment.id,
		heichelId: comment.heichelId,
		seriesId: comment.seriesId,
		parentId: comment.postId,
		sectionId: comment.subsectionId || comment.verseSection,
		aliasId: comment.aliasId
	};
}

function canonicalReference(reference = {}) {
	return Boolean(reference.id && reference.heichelId && reference.kind !== 'url');
}

function graphNote(reference = {}) {
	return reference.relation
		? `Embedded canonical reference; semantic relation: ${reference.relation}.`
		: 'Embedded as a canonical reference inside a rich comment.';
}

async function connectReferences({ $i, comment, references }) {
	const graph = [];
	for (const reference of references.filter(canonicalReference)) {
		graph.push(await addGraphReference({
			$i,
			from: commentEntity(comment),
			to: {
				type: reference.type,
				id: reference.id,
				heichelId: reference.heichelId,
				seriesId: reference.seriesId,
				sectionId: reference.sectionId
			},
			kind: 'references',
			aliasId: comment.aliasId,
			note: graphNote(reference)
		}));
	}
	return graph;
}

module.exports = {
	canonicalReference,
	commentEntity,
	connectReferences,
	graphNote,
	nativeLink
};
