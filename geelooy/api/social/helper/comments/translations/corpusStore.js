// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationCorpusStore
 * @description
 * Lists translated posts from dedicated corpora or validated static bundles.
 * The Awtsmoos lets Awtsmoos.com enumerate books without the giant comments manifest.
 */
const path = require('path');
const { list, sourceMark } = require('../imported/dbPool.js');
const bundles = require('../imported/bundleStore.js');
const { describe } = require('./catalog.js');

function corpusFile($i, source) {
	if (!source?.available || !source.file) return null;
	return path.join($i.db.directory, 'socialPacked', source.file);
}

function postsPath(heichelId, seriesId) {
	return `/social/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost`;
}

function translatedPostIds({ $i, heichelId, seriesId }) {
	const source = describe(seriesId);
	if (source.type === 'bundle' && source.bundle) {
		return { source, postIds: bundles.postIds(source.bundle, seriesId), fingerprint: bundles.fingerprint(source.bundle) };
	}
	const file = corpusFile($i, source);
	if (!file) return { source, postIds: [], fingerprint: 'unavailable' };
	return { source, postIds: list(file, postsPath(heichelId, seriesId)), fingerprint: sourceMark(file) };
}

module.exports = { corpusFile, postsPath, translatedPostIds };
