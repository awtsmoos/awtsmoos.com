// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentReadCore
 * @description
 * Native social comments prefer compressed FS3 and the live DosDB contract.
 * Tanach, Talmud, and Mishnah commentary shards are authoritative and isolated:
 * their requests never evaluate or open the global packed comments database.
 */

const canonical = require('./canonicalCommentSource.js');
const database = require('./databaseCommentSource.js');
const shards = require('./commentShardBridge.js');
const { familyForSeries } = require('./commentShardReader.js');
const { OLD_SOURCE, attempt } = require('./commentReadReport.js');

const AUTHORITATIVE_SHARD_FAMILIES = new Set([
	'mishnah',
	'talmudBavli',
	'tanach'
]);

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

function shardIsAuthoritative(context = {}) {
	return AUTHORITATIVE_SHARD_FAMILIES.has(
		familyForSeries(context.seriesId)
	);
}

async function choose(context, readers) {
	if (shardIsAuthoritative(context)) {
		return shardAttempt(readers.shard())
			|| authoritativeAttempt([], 'derived-shard-empty');
	}
	const direct = authoritativeAttempt(
		await readers.canonical(),
		'compressed-fs3'
	);
	if (direct.count) return direct;
	const compatible = authoritativeAttempt(
		await readers.database(),
		'dosdb-contract'
	);
	if (compatible.count) return compatible;
	return shardAttempt(readers.shard()) || direct;
}

async function readAuthorVerse(context, filePath, verseSection) {
	return choose(context, {
		canonical: () => canonical.readVerse(context, filePath, verseSection),
		database: () => database.readVerse(context, filePath, verseSection),
		shard: () => shards.readAliasSection(context, verseSection)
	});
}

async function readAuthorAll(context, filePath) {
	return choose(context, {
		canonical: () => canonical.readAll(context, filePath),
		database: () => database.readAll(context, filePath),
		shard: () => shards.readAliasAll(context)
	});
}

async function readSections(context, filePath) {
	return choose(context, {
		canonical: () => canonical.readSections(context, filePath),
		database: () => database.readSections(context, filePath),
		shard: () => shards.readAliasSections(context)
	});
}

async function readAuthors(context, basePath, verseSection) {
	return choose(context, {
		canonical: () => canonical.readAuthors(context, basePath, verseSection),
		database: () => database.readAuthors(context, basePath, verseSection),
		shard: () => shards.readAuthors(context, verseSection)
	});
}

module.exports = {
	AUTHORITATIVE_SHARD_FAMILIES,
	authoritativeAttempt,
	choose,
	readAuthorAll,
	readAuthors,
	readAuthorVerse,
	readSections,
	shardAttempt,
	shardIsAuthoritative
};
