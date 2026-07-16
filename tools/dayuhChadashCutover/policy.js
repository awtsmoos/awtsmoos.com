// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverPolicy
 * @description
 * The Awtsmoos separates canonical social truth from recoverable shadows. This
 * allowlist names every vessel permitted to leave the one-gigabyte data root;
 * unknown files remain untouched, while the full raw tree survives in quarantine.
 */

const path = require('path');

const DOCUMENTS = '/Users/awtsmoos/Documents';
const DATA_ROOT = path.join(DOCUMENTS, 'awtsmoos/dayuhChadash');
const PACKED_ROOT = path.join(DATA_ROOT, 'socialPacked');
const RUNTIME_ROOT = path.join(DOCUMENTS, 'dayuhChadash-runtime');
const AI_SOURCE = path.join(DATA_ROOT, 'ai');
const AI_DESTINATION = path.join(RUNTIME_ROOT, 'ai');
const QUARANTINE_ROOT = path.join(
	DOCUMENTS,
	'dayuhChadash-review/final-cutover-quarantine-20260716T0839Z'
);

const PACKED_NAMES = [
	'commentShards',
	'social.core.awtsocial',
	'social.core..oiledawtsocial',
	'social.audit.awtsocial',
	'social.feed.awtsocial',
	'comment-corpus-shards.manifest.json',
	'comment-corpus-shards.v2.manifest.json',
	'meluket-post-map.v1.json'
];

const PACKED_PATTERNS = [
	/^social\.heichel\.ikar\.comments\.corpus\./
];

function packedEntries() {
	return [
		...PACKED_NAMES.map(name => path.join(PACKED_ROOT, name))
	];
}

function rawSocialSource() {
	return path.join(DATA_ROOT, 'social');
}

function quarantinePath(source) {
	const relative = path.relative(DATA_ROOT, source);
	return path.join(QUARANTINE_ROOT, 'data-root', relative);
}

function cutoverStateFile() {
	return path.join(QUARANTINE_ROOT, 'cutover-state.json');
}

module.exports = {
	AI_DESTINATION,
	AI_SOURCE,
	DATA_ROOT,
	PACKED_NAMES,
	PACKED_PATTERNS,
	PACKED_ROOT,
	QUARANTINE_ROOT,
	RUNTIME_ROOT,
	cutoverStateFile,
	packedEntries,
	quarantinePath,
	rawSocialSource
};