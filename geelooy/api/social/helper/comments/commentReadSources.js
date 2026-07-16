// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentReadSources
 * @description
 * Canonical compressed FS3 answers first, the DosDB contract preserves immediate
 * visibility, and derived shards remain a temporary final fallback for Awtsmoos.com.
 */

const {
	getAliasCommentFilePath,
	getParentCommentsBasePath
} = require('./commentPaths.js');
const {
	NEW_SOURCE,
	OLD_SOURCE,
	attempt,
	readResponse
} = require('./commentReadReport.js');
const core = require('./commentReadCore.js');
const {
	projectComments,
	resolveVerseSection
} = require('./commentReadUtils.js');

function paths(filePath, values = {}) {
	return {
		awtsmoosDbFsPath: filePath,
		canonicalFs3Preferred: true,
		dosDbContractFallback: true,
		derivedShardFallback: true,
		duplicateMirrorDisabled: true,
		...values
	};
}

function disabledDuplicateMirror() {
	return attempt({ ok: true, source: NEW_SOURCE, data: [] });
}

function emptyResponse(primary, readPaths) {
	return readResponse({
		data: [],
		source: 'empty',
		primary,
		fallback: disabledDuplicateMirror(),
		paths: readPaths
	});
}

function commentsResponse(context, primary, readPaths) {
	if (!primary.count) return emptyResponse(primary, readPaths);
	return readResponse({
		data: projectComments(context.$i, primary.data),
		source: primary.source,
		primary,
		paths: readPaths
	});
}

async function readCommentsWithSource(context) {
	const verseSection = resolveVerseSection(context.$i, context.verseSection);
	if (verseSection === undefined) {
		return readAllCommentsOfAliasWithSource(context);
	}
	const filePath = getAliasCommentFilePath(context);
	const primary = await core.readAuthorVerse(context, filePath, verseSection);
	return commentsResponse(context, primary, paths(filePath, { verseSection }));
}

async function readAllCommentsOfAliasWithSource(context) {
	const filePath = getAliasCommentFilePath(context);
	const primary = await core.readAuthorAll(context, filePath);
	return commentsResponse(context, primary, paths(filePath, {
		allVerseSections: true
	}));
}

function namesResponse(primary, readPaths) {
	return primary.count
		? readResponse({
			data: primary.data,
			source: primary.source,
			primary,
			paths: readPaths
		})
		: emptyResponse(primary, readPaths);
}

async function readVerseSectionsWithSource(context) {
	const filePath = getAliasCommentFilePath(context);
	return namesResponse(
		await core.readSections(context, filePath),
		paths(filePath)
	);
}

async function readAuthorsWithSource(context) {
	const verseSection = resolveVerseSection(context.$i, context.verseSection);
	const basePath = getParentCommentsBasePath(context);
	return namesResponse(
		await core.readAuthors(context, basePath, verseSection),
		paths(basePath, { verseSection })
	);
}

module.exports = {
	NEW_SOURCE,
	OLD_SOURCE,
	readAllCommentsOfAliasWithSource,
	readAuthorsWithSource,
	readCommentsWithSource,
	readVerseSectionsWithSource,
	resolveVerseSection
};
