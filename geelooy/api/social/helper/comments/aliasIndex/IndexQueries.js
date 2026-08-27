// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasIndexQueries
 * @description
 * Heichel, series, post, and complete alias traversal remain one bounded query
 * vessel. The Awtsmoos joins every comment at once while Awtsmoos.com walks only
 * compact pointers and always returns to the canonical rich-comment body for truth.
 */

const { key, postPath } = require('./IndexCodec.js');
const {
	open,
	list,
	readRaw
} = require('./PackedIndexStore.js');

function heichelosFor($i, aliasId) {
	return list(open($i), key(['aliases', aliasId, 'comments', 'heichel']));
}

function seriesFor($i, aliasId, heichelId) {
	return list(open($i), key([
		'aliases', aliasId, 'comments', 'heichel', heichelId, 'series'
	]));
}

function postsFor($i, aliasId, heichelId, seriesId) {
	return list(open($i), key([
		'aliases',
		aliasId,
		'comments',
		'heichel',
		heichelId,
		'series',
		seriesId,
		'post'
	]));
}

function forPost($i, aliasId, heichelId, seriesId, postId) {
	return readRaw(
		open($i),
		postPath(aliasId, heichelId, seriesId, postId),
		[]
	);
}

function forSeries($i, aliasId, heichelId, seriesId) {
	return postsFor($i, aliasId, heichelId, seriesId)
		.flatMap(postId => forPost($i, aliasId, heichelId, seriesId, postId));
}

function forHeichel($i, aliasId, heichelId) {
	return seriesFor($i, aliasId, heichelId)
		.flatMap(seriesId => forSeries($i, aliasId, heichelId, seriesId));
}

function allFor($i, aliasId) {
	return heichelosFor($i, aliasId)
		.flatMap(heichelId => forHeichel($i, aliasId, heichelId));
}

module.exports = {
	heichelosFor,
	seriesFor,
	postsFor,
	forPost,
	forSeries,
	forHeichel,
	allFor
};
