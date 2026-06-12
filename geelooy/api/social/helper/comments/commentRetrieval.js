// B"H
/**
 * @file commentRetrieval.js
 * @chapter The River Chooses The New Vessel First
 * @description
 * Retrieval normalizes the caller's coordinate, then asks the authoritative
 * comment-tree path only. Undefined verse means broad post-scroll discovery;
 * an explicit verse means exact alias-at-verse retrieval.
 */

const { er } = require("../general.js");
const {
    resolveVerseSection,
    readCommentsWithSource,
    readAllCommentsOfAliasWithSource,
    readVerseSectionsWithSource,
    readAuthorsWithSource
} = require("./commentReadSources.js");

/** @param {object} params @param {object} options @returns {object} */
function buildContext(params, options = {}) {
    const $i = params.$i;
    const parentType = params.parentType || $i.$_GET?.parentType || "post";
    const context = {
        $i,
        aliasId: params.aliasId || $i.$_GET?.aliasId,
        parentType,
        parentId: params.parentId || $i.$_GET?.parentId,
        heichelId: params.heichelId || $i.$_GET?.heichelId,
        postId: params.postId || (parentType === "comment" ? $i.$_GET?.postId : params.parentId),
        seriesId: params.seriesId || $i.$_GET?.seriesId
    };
    if (!options.omitVerseSection) {
        const verseSection = resolveVerseSection($i, params.verseSection);
        if (verseSection !== undefined) context.verseSection = verseSection;
    }
    return context;
}

/** @param {object} context @param {object} options @returns {object|null} */
function validateContext(context, options = {}) {
    const missing = [];
    if (options.needAlias && !context.aliasId) missing.push("aliasId");
    if (!context.parentId) missing.push("parentId");
    if (!context.heichelId) missing.push("heichelId");
    if (!context.seriesId) missing.push("seriesId");
    if (context.parentType === "comment" && !context.postId) missing.push("postId");
    if (!missing.length) return null;
    return er({ message: "Missing required parameters", code: "MISSING_PARAMS", missing, context: cleanContext(context) });
}

/** @param {object} context @returns {object} */
function cleanContext(context) {
    return {
        aliasId: context.aliasId,
        parentType: context.parentType,
        parentId: context.parentId,
        heichelId: context.heichelId,
        postId: context.postId,
        seriesId: context.seriesId
    };
}

/** @param {object} params @returns {Promise<object>} */
async function getCommentsByAliasAtVerseSection(params) {
    const context = buildContext(params);
    const invalid = validateContext(context, { needAlias: true });
    if (invalid) return invalid;
    return await readCommentsWithSource(context);
}

/** @param {object} params @returns {Promise<object>} */
async function getAllCommentsByAliasInParent(params) {
    const context = buildContext(params, { omitVerseSection: true });
    const invalid = validateContext(context, { needAlias: true });
    if (invalid) return invalid;
    return await readAllCommentsOfAliasWithSource(context);
}

/** @param {object} params @returns {Promise<object>} */
async function getVerseSectionsCommentedByAuthorInParent(params) {
    const context = buildContext(params, { omitVerseSection: true });
    const invalid = validateContext(context, { needAlias: true });
    if (invalid) return invalid;
    return await readVerseSectionsWithSource(context);
}

/** @param {object} params @returns {Promise<object>} */
async function getAuthorsCommentingAtVerseSectionInParent(params) {
    const context = buildContext(params);
    const invalid = validateContext(context, { needAlias: false });
    if (invalid) return invalid;
    return await readAuthorsWithSource(context);
}

/** @param {object} params @returns {Promise<object|null>} */
async function getComment(params) {
    const commentId = params.commentId || params.$i.$_GET?.commentId;
    if (!commentId) return er({ message: "Missing required parameter: commentId", code: "MISSING_PARAMS" });
    const result = await getCommentsByAliasAtVerseSection(params);
    if (result.error || !Array.isArray(result.success)) return result.error || null;
    const found = result.success.find(comment => comment && comment.id === commentId);
    if (!found) return null;
    return { ...found, awtsmoosCommentRead: result.awtsmoosCommentRead };
}

module.exports = {
    getCommentsByAliasAtVerseSection,
    getAllCommentsByAliasInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent,
    getComment
};


