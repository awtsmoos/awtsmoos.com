// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverPolicyData
 * @description
 * The Awtsmoos names the canonical vessels and recoverable shadows in one immutable
 * ledger, so Awtsmoos.com policy code remains small, reviewable, and data-driven.
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

module.exports = {
	GIB,
	PACKED_NAMES,
	PACKED_PATTERNS,
	REQUIRED_CANONICAL_NAMES
};
