// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverPolicyData
 * @description
 * The Awtsmoos names canonical vessels, reversible shadows, and one hard active
 * ceiling, so storage truth cannot hide behind two separately green budgets.
 */

const GIB = 1024 * 1024 * 1024;
const PACKED_NAMES = Object.freeze([
	'commentShards',
	'social.core.awtsocial',
	'social.core..oiledawtsocial',
	'social.audit.awtsocial',
	'social.feed.awtsocial',
	'comment-corpus-shards.manifest.json',
	'comment-corpus-shards.v2.manifest.json',
	'meluket-post-map.v1.json'
]);
const PACKED_PATTERNS = Object.freeze([
	/^social\.heichel\.ikar\.comments\.corpus\./
]);
const REQUIRED_CANONICAL_NAMES = Object.freeze([
	'social.heichel.ikar.comments.fs.awtsdb',
	'social.heichel.ikar.posts.fs.awtsdb',
	'social.heichel.ikar.series.fs.awtsdb',
	'social.aliasCommentIndex.fs.awtsdb'
]);
const EMBED_MODEL_NAME = 'bge-small-en-v1.5-q8_0.gguf';
const EMBED_DIMENSIONS = 384;

module.exports = {
	EMBED_DIMENSIONS,
	EMBED_MODEL_NAME,
	GIB,
	PACKED_NAMES,
	PACKED_PATTERNS,
	REQUIRED_CANONICAL_NAMES
};
