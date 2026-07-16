// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentReadCore
 * @description
 * Canonical compressed FS3 answers first. Derived shards are temporary fallback
 * only, making their eventual quarantine observable and safe.
 */

const canonical = require('./canonicalCommentSource.js');
const shards = require('./commentShardBridge.js');
const { OLD_SOURCE, attempt } = require('./commentReadReport.js');

function canonicalAttempt(data) {
	return attempt({ ok: true, source: OLD_SOURCE, data });
}

function shardAttempt(hit) {
	if (!hit?.data?.length) return null;
	return attempt({
		ok: true,
		source: shards.SHARD_SOURCE,
		data: hit.data,
		paths: {
			shardFile: hit.file,
			shardMajor: hit.majorId,
			shardVirtualPath: hit.virtualPath
		}
	});
}

function readAuthorVerse(context, filePath, verseSection) {
	const direct = canonicalAttempt(canonical.readVerse(
		context,
		filePath,
		verseSection
	));
	if (direct.count) return direct;
	return shardAttempt(shards.readAliasSection(context, verseSection)) || direct;
}

function readAuthorAll(context, filePath) {
	const direct = canonicalAttempt(canonical.readAll(context, filePath));
	if (direct.count) return direct;
	return shardAttempt(shards.readAliasAll(context)) || direct;
}

function readSections(context, filePath) {
	const direct = canonicalAttempt(canonical.readSections(context, filePath));
	if (direct.count) return direct;
	return shardAttempt(shards.readAliasSections(context)) || direct;
}

function readAuthors(context, basePath, verseSection) {
	const direct = canonicalAttempt(canonical.readAuthors(
		context,
		basePath,
		verseSection
	));
	if (direct.count) return direct;
	return shardAttempt(shards.readAuthors(context, verseSection)) || direct;
}

module.exports = {
	canonicalAttempt,
	readAuthorAll,
	readAuthors,
	readAuthorVerse,
	readSections,
	shardAttempt
};