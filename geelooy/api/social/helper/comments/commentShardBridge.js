// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentShardBridge
 * @description
 * Converts exact social coordinates into one classified derived shard. Alias
 * discovery reads only filenames; comment payload reads open one exact shard and
 * close its complete AwtsmoosDB lifecycle before returning.
 */

const {
	aliasFiles,
	encodePart,
	familyForSeries,
	readVirtualFile,
	shardFile,
	shardRoot
} = require('./commentShardReader.js');
const {
	shardHit,
	unwrapRows
} = require('./commentShardRows.js');

const SHARD_SOURCE = 'commentShard';

function virtualBase(context) {
	return `/bySeries/${encodePart(context.seriesId)}/byPost/${encodePart(context.parentId)}`;
}

function eligible(context) {
	return context?.parentType === 'post'
		&& context?.seriesId
		&& context?.parentId
		&& familyForSeries(context.seriesId);
}

function readFromAliasShard(context, aliasId, virtualPath) {
	if (!eligible(context) || !aliasId) return null;
	const file = shardFile(context, aliasId);
	const data = unwrapRows(readVirtualFile(file, virtualPath));
	if (Array.isArray(data) && data.length) {
		return shardHit(context, file, virtualPath, data, familyForSeries);
	}
	if (data && typeof data === 'object' && Object.keys(data).length) {
		return shardHit(context, file, virtualPath, data, familyForSeries);
	}
	return null;
}

function readAliasSection(context, verseSection) {
	return readFromAliasShard(
		context,
		context.aliasId,
		`${virtualBase(context)}/bySection/${encodePart(verseSection)}.awtsmoosJSON`
	);
}

function readAliasAll(context) {
	return readFromAliasShard(
		context,
		context.aliasId,
		`${virtualBase(context)}/comments.awtsmoosJSON`
	);
}

function readAliasSections(context) {
	const result = readAliasAll(context);
	if (!result || !Array.isArray(result.data)) return null;
	const sections = [...new Set(result.data
		.map(row => row?.verseSection ?? row?.dayuh?.verseSection)
		.filter(value => value !== undefined && value !== null))];
	return { ...result, data: sections.map(String) };
}

function readAuthors(context) {
	if (!eligible(context)) return null;
	const authors = aliasFiles(context);
	return authors.length
		? authorCatalog(context, authors)
		: null;
}

function authorCatalog(context, authors) {
	return {
		data: authors,
		majorId: familyForSeries(context.seriesId),
		file: shardRoot(context),
		virtualPath: virtualBase(context),
		discoveryMode: 'familyAliasCatalog'
	};
}

module.exports = {
	SHARD_SOURCE,
	readAliasAll,
	readAliasSection,
	readAliasSections,
	readAuthors
};
