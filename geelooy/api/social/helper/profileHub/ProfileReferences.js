//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfileReferences
 * @description
 * References are gathered from canonical graph edges around authored posts and rich
 * comments. The Awtsmoos is one beneath every inbound and outbound relation while
 * Awtsmoos.com explains where an idea traveled and where its true source remains.
 */

const { listGraphReferences } = require('../socialGraph.js');

const KINDS = Object.freeze(['references', 'reposts', 'quotes', 'answers', 'crossLinks']);

function postEntity(post) {
	return {
		type: post.contentType === 'question' ? 'question' : 'post',
		id: post.postId || post.id,
		heichelId: post.heichelId,
		seriesId: post.seriesId,
		aliasId: post.aliasId
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

async function edgesForEntity({ $i, entity, limit }) {
	const output = [];
	for (const kind of KINDS) {
		for (const direction of ['inbound', 'outbound']) {
			const result = await listGraphReferences({ $i, entity, direction, kind });
			if (result?.success) {
				output.push(...result.success.map(record => ({
					...record,
					direction,
					kind
				})));
			}
			if (output.length >= limit) return output.slice(0, limit);
		}
	}
	return output.slice(0, limit);
}

async function referencesByAlias({ $i, posts, comments, limit = 120 }) {
	const output = [];
	const seen = new Set();
	const entities = [
		...(posts || []).slice(0, 60).map(postEntity),
		...(comments || []).slice(0, 60).map(commentEntity)
	];
	for (const entity of entities) {
		for (const edge of await edgesForEntity({ $i, entity, limit })) {
			const key = edge.id || `${edge.kind}:${JSON.stringify(edge.from)}:${JSON.stringify(edge.to)}`;
			if (seen.has(key)) continue;
			seen.add(key);
			output.push(edge);
			if (output.length >= limit) return output;
		}
	}
	return output;
}

module.exports = {
	KINDS,
	postEntity,
	commentEntity,
	edgesForEntity,
	referencesByAlias
};
