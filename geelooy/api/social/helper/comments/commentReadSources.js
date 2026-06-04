// B"H
/**
 * @file commentReadSources.js
 * @chapter The Mirror Before The Scroll
 * @description The Awtsmoos asks the new packed mirror first, then legacy JSON.
 */

const {
    getAliasCommentFilePath,
    getParentCommentsBasePath
} = require("./commentPaths.js");

const {
    readCommentShardRecords,
    listPackedCommentAuthors,
    listPackedCommentVerseSections
} = require("./commentShardMirror.js");

const {
    NEW_SOURCE,
    OLD_SOURCE,
    attempt,
    readResponse
} = require("./commentReadReport.js");

/** @param {object} $i @param {string|number} verseSection @returns {string|number} */
function resolveVerseSection($i, verseSection) {
    if (verseSection === undefined || verseSection === null) verseSection = $i.$_GET?.verseSection;
    return verseSection === undefined || verseSection === null ? "root" : verseSection;
}

/** @param {object} context @returns {object} */
function tryNewComments(context) {
    try {
        return attempt({ ok: true, source: NEW_SOURCE, data: readCommentShardRecords(context) });
    } catch (error) {
        return attempt({ ok: false, source: NEW_SOURCE, error });
    }
}

/** @param {object} context @param {string} legacyPath @param {string|number} verseSection @returns {Promise<object>} */
async function tryOldComments(context, legacyPath, verseSection) {
    try {
        const data = await context.$i.db.getObjectKey(legacyPath, verseSection);
        return attempt({ ok: true, source: OLD_SOURCE, data: Array.isArray(data) ? data : [] });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

/** @param {object} context @returns {Promise<object>} */
async function readCommentsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const legacyPath = getAliasCommentFilePath({ ...context, verseSection });
    const paths = { newPackedShard: "socialPacked/social.core.awtsocial", legacyAliasCommentPath: legacyPath, verseSection };
    const primary = tryNewComments({ ...context, verseSection });
    if (primary.count > 0) return readResponse({ data: primary.data, source: NEW_SOURCE, primary, paths });
    const fallback = await tryOldComments(context, legacyPath, verseSection);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? OLD_SOURCE : "empty", primary, fallback, paths });
}

/** @param {object} context @returns {Promise<object>} */
async function readVerseSectionsWithSource(context) {
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { newPackedShard: "socialPacked/social.core.awtsocial", legacyAliasCommentPath: legacyPath };
    const primary = tryNewVerseSections(context);
    if (primary.count > 0) return readResponse({ data: primary.data, source: NEW_SOURCE, primary, paths });
    const fallback = await tryOldVerseSections(context, legacyPath);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? OLD_SOURCE : "empty", primary, fallback, paths });
}

/** @param {object} context @returns {object} */
function tryNewVerseSections(context) {
    try {
        return attempt({ ok: true, source: NEW_SOURCE, data: listPackedCommentVerseSections(context) });
    } catch (error) {
        return attempt({ ok: false, source: NEW_SOURCE, error });
    }
}

/** @param {object} context @param {string} legacyPath @returns {Promise<object>} */
async function tryOldVerseSections(context, legacyPath) {
    try {
        const data = await context.$i.db.getObjectKeys(legacyPath);
        return attempt({ ok: true, source: OLD_SOURCE, data: Array.isArray(data) ? data : [] });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

/** @param {object} context @returns {Promise<object>} */
async function readAuthorsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const legacyBase = getParentCommentsBasePath(context);
    const paths = { newPackedShard: "socialPacked/social.core.awtsocial", legacyParentCommentPath: legacyBase, verseSection };
    const primary = tryNewAuthors({ ...context, verseSection });
    if (primary.count > 0) return readResponse({ data: primary.data, source: NEW_SOURCE, primary, paths });
    const fallback = await readOldAuthors(context, legacyBase, verseSection);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? OLD_SOURCE : "empty", primary, fallback, paths });
}

/** @param {object} context @returns {object} */
function tryNewAuthors(context) {
    try {
        return attempt({ ok: true, source: NEW_SOURCE, data: listPackedCommentAuthors(context) });
    } catch (error) {
        return attempt({ ok: false, source: NEW_SOURCE, error });
    }
}

/** @param {object} context @param {string} legacyBase @param {string|number} verseSection @returns {Promise<object>} */
async function readOldAuthors(context, legacyBase, verseSection) {
    try {
        const allAliases = await context.$i.db.get(legacyBase);
        const authors = [];
        for (const aliasId of Array.isArray(allAliases) ? allAliases : []) {
            if (await context.$i.db.hasObjectKey(`${legacyBase}/${aliasId}`, verseSection)) authors.push(aliasId);
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: authors });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

module.exports = {
    NEW_SOURCE,
    OLD_SOURCE,
    resolveVerseSection,
    readCommentsWithSource,
    readVerseSectionsWithSource,
    readAuthorsWithSource
};
