// B"H
/**
 * @file commentReadSources.js
 * @chapter The Mirror Before The Scroll
 * @description
 * Comment reads ask the new packed mirror first and the legacy JSON tree second.
 * The Awtsmoos distinguishes three gates: exact alias+verse comments, all verse
 * sections of one alias, and all aliases on a post/verse/post-scroll.
 */

const { getAliasCommentFilePath, getParentCommentsBasePath } = require("./commentPaths.js");
const { readCommentShardRecords, listPackedCommentAuthors, listPackedCommentVerseSections } = require("./commentShardMirror.js");
const { NEW_SOURCE, OLD_SOURCE, attempt, readResponse } = require("./commentReadReport.js");

/** @param {*} value @returns {Array<string>} */
function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

/** @param {object} $i @param {string|number} verseSection @returns {string|number|undefined} */
function resolveVerseSection($i, verseSection) {
    if (verseSection === undefined || verseSection === null || verseSection === "") verseSection = $i.$_GET?.verseSection;
    if (verseSection === undefined || verseSection === null || verseSection === "") return undefined;
    return verseSection;
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
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { newPackedShard: "socialPacked/social.core.awtsocial", legacyAliasCommentPath: legacyPath, verseSection };
    if (verseSection === undefined) return await readAllCommentsOfAliasWithSource(context);
    const primary = tryNewComments({ ...context, verseSection });
    if (primary.count > 0) return readResponse({ data: primary.data, source: NEW_SOURCE, primary, paths });
    const fallback = await tryOldComments(context, legacyPath, verseSection);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? OLD_SOURCE : "empty", primary, fallback, paths });
}

/** @param {object} context @returns {Promise<object>} */
async function readAllCommentsOfAliasWithSource(context) {
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { newPackedShard: "socialPacked/social.core.awtsocial", legacyAliasCommentPath: legacyPath, allVerseSections: true };
    const primary = tryNewComments({ ...context, verseSection: undefined });
    if (primary.count > 0) return readResponse({ data: primary.data, source: NEW_SOURCE, primary, paths });
    const fallback = await readOldAllCommentsOfAlias(context, legacyPath);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? OLD_SOURCE : "empty", primary, fallback, paths });
}

/** @param {object} context @param {string} legacyPath @returns {Promise<object>} */
async function readOldAllCommentsOfAlias(context, legacyPath) {
    try {
        const verseSections = names(await context.$i.db.getObjectKeys(legacyPath));
        const comments = [];
        for (const verseSection of verseSections) {
            const rows = await context.$i.db.getObjectKey(legacyPath, verseSection).catch(() => []);
            if (!Array.isArray(rows)) continue;
            for (const row of rows) comments.push({ ...row, verseSection: row?.verseSection ?? row?.dayuh?.verseSection ?? verseSection });
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: comments });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
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
        return attempt({ ok: true, source: NEW_SOURCE, data: listPackedCommentVerseSections({ ...context, verseSection: undefined }) });
    } catch (error) {
        return attempt({ ok: false, source: NEW_SOURCE, error });
    }
}

/** @param {object} context @param {string} legacyPath @returns {Promise<object>} */
async function tryOldVerseSections(context, legacyPath) {
    try {
        return attempt({ ok: true, source: OLD_SOURCE, data: names(await context.$i.db.getObjectKeys(legacyPath)) });
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

/** @param {object} context @param {string} legacyBase @param {string|number|undefined} verseSection @returns {Promise<object>} */
async function readOldAuthors(context, legacyBase, verseSection) {
    try {
        const aliases = names(await context.$i.db.get(legacyBase));
        if (verseSection === undefined) return attempt({ ok: true, source: OLD_SOURCE, data: aliases });
        const authors = [];
        for (const aliasId of aliases) {
            if (await context.$i.db.hasObjectKey(`${legacyBase}/${aliasId}`, verseSection)) authors.push(aliasId);
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: authors });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

module.exports = { NEW_SOURCE, OLD_SOURCE, resolveVerseSection, readCommentsWithSource, readAllCommentsOfAliasWithSource, readVerseSectionsWithSource, readAuthorsWithSource };
