//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentGraphService
 * @description
 * A rich comment may point toward canonical posts, answers, or questions without
 * copying their bodies. The Awtsmoos joins every idea at its root while
 * Awtsmoos.com records each reference from the comment's true graph identity.
 */

const { addGraphReference } = require('../socialGraph.js');

function nativeLink(reference) {
	return {
		kind: reference.kind,
		postId: reference.id,
		heichelId: reference.heichelId,
		seriesId: reference.seriesId,
		sectionId: reference.sectionId,
		label: reference.label
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

async function connectReferences({ $i, comment, references }) {
	const graph = [];
	for (const reference of references) {
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
			note: 'Embedded as a canonical reference inside a rich comment.'
		}));
	}
	return graph;
}

module.exports = {
	nativeLink,
	commentEntity,
	connectReferences
};
