// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentReadCore
 * @description
 * The Awtsmoos asks compressed FS3 first, the caller's DosDB contract second, and
 * derived shards last. Awtsmoos.com therefore preserves read-after-write truth while
 * quarantine can remove historical fallback stores without changing public APIs.
 */

const canonical = require('./canonicalCommentSource.js');
const database = require('./databaseCommentSource.js');
const shards = require('./commentShardBridge.js');
const { OLD_SOURCE, attempt } = require('./commentReadReport.js');

function authoritativeAttempt(data, pathKind) {
	return attempt({
		ok: true,
		source: OLD_SOURCE,
		data,
		paths: { pathKind }
	});
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

async function choose(canonicalData, databaseReader, shardReader) {
	const direct = authoritativeAttempt(canonicalData, 'compressed-fs3');
	if (direct.count) return direct;
	const compatible = authoritativeAttempt(
		await databaseReader(),
		'dosdb-contract'
	);
	if (compatible.count) return compatible;
	return shardAttempt(shardReader()) || direct;
}

async function readAuthorVerse(context, filePath, verseSection) {
	return choose(
		canonical.readVerse(context, filePath, verseSection),
		() => database.readVerse(context, filePath, verseSection),
		() => shards.readAliasSection(context, verseSection)
	);
}

async function readAuthorAll(context, filePath) {
	return choose(
		canonical.readAll(context, filePath),
		() => database.readAll(context, filePath),
		() => shards.readAliasAll(context)
	);
}

async function readSections(context, filePath) {
	return choose(
		canonical.readSections(context, filePath),
		() => database.readSections(context, filePath),
		() => shards.readAliasSections(context)
	);
}

async function readAuthors(context, basePath, verseSection) {
	return choose(
		canonical.readAuthors(context, basePath, verseSection),
		() => database.readAuthors(context, basePath, verseSection),
		() => shards.readAuthors(context, verseSection)
	);
}

module.exports = {
	authoritativeAttempt,
	choose,
	readAuthorAll,
	readAuthors,
	readAuthorVerse,
	readSections,
	shardAttempt
};
