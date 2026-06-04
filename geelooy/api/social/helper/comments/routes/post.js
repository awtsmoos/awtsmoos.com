/*B"H*/
/**
 * @file routes/post.js
 * @chapter The Post Comment Gates Are Named Clearly
 * @description
 * Post comments are not reply-comments. These routes expose direct, navigable
 * gates for post aliases, alias sections, and exact alias-at-verse comments,
 * while keeping older route shapes alive for cached frontend callers.
 */

const {
    addComment,
    editComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent,
    getCommentsByAliasAtVerseSection,
    getAllCommentsByAliasInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent
} = require("../index.js");

const { er, methodIs, getUserId } = require("./utils.js");

/** @param {object} source @returns {object|null} */
function needSeries(source) {
    return source?.seriesId ? null : er({ message: "Missing required parameter: seriesId", code: "MISSING_PARAMS" });
}

/** @param {object} $i @returns {string|undefined} */
function verse($i) {
    const value = $i.$_GET?.verseSection ?? $i.$_GET?.idx;
    return value === "" || value === null ? undefined : value;
}

/** @param {object} params @returns {object} */
function postContext({ $i, vars, seriesId }) {
    return { $i, heichelId: vars.heichel, parentType: "post", parentId: vars.post, postId: vars.post, seriesId };
}

/** @param {object} params @returns {Promise<object>} */
async function readAliases({ $i, vars, seriesId }) {
    return await getAuthorsCommentingAtVerseSectionInParent({ ...postContext({ $i, vars, seriesId }), verseSection: verse($i) });
}

/** @param {object} params @returns {Promise<object>} */
async function readAliasSections({ $i, vars, seriesId, aliasId }) {
    return await getVerseSectionsCommentedByAuthorInParent({ ...postContext({ $i, vars, seriesId }), aliasId });
}

/** @param {object} params @returns {Promise<object>} */
async function readAliasComments({ $i, vars, seriesId, aliasId }) {
    const v = verse($i);
    if (v === undefined || $i.$_GET?.all === "true") {
        return await getAllCommentsByAliasInParent({ ...postContext({ $i, vars, seriesId }), aliasId });
    }
    return await getCommentsByAliasAtVerseSection({ ...postContext({ $i, vars, seriesId }), aliasId, verseSection: v });
}

/** @param {object} params @returns {Promise<object>} */
async function handlePostCommentCollection({ $i, userid, vars }) {
    if (methodIs($i, "GET")) return await readPostCommentGet({ $i, vars });
    if (methodIs($i, "POST")) return await createPostComment({ $i, userid, vars });
    if (methodIs($i, "PUT")) return await updatePostComment({ $i, userid, vars });
    if (methodIs($i, "DELETE")) return await deletePostComments({ $i, userid, vars });
    return er({ message: "Method Not Allowed", code: 405 });
}

/** @param {object} params @returns {Promise<object>} */
async function readPostCommentGet({ $i, vars }) {
    const seriesId = $i.$_GET.seriesId;
    const missing = needSeries($i.$_GET);
    if (missing) return missing;
    if ($i.$_GET.aliasId) return await readAliasComments({ $i, vars, seriesId, aliasId: $i.$_GET.aliasId });
    return await readAliases({ $i, vars, seriesId });
}

/** @param {object} params @returns {Promise<object>} */
async function createPostComment({ $i, userid, vars }) {
    const { seriesId, aliasId } = $i.$_POST;
    if (!seriesId) return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
    if (!aliasId) return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
    return await addComment({ ...postContext({ $i, vars, seriesId }), userid, aliasId });
}

/** @param {object} params @returns {Promise<object>} */
async function updatePostComment({ $i, userid, vars }) {
    const { commentId, aliasId, seriesId, verseSection, content, dayuh } = $i.$_PUT;
    if (!commentId || !aliasId || !seriesId || verseSection === undefined) return er({ message: "Missing required PUT parameters: commentId, aliasId, seriesId, verseSection", code: "MISSING_PARAMS" });
    if (content === undefined && dayuh === undefined) return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
    return await editComment({ ...postContext({ $i, vars, seriesId }), userid, commentId, aliasId, verseSection, newContent: content, newDayuh: dayuh });
}

/** @param {object} params @returns {Promise<object>} */
async function deletePostComments({ $i, userid, vars }) {
    const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId;
    if (!seriesId) return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
    const requestingUserid = getUserId($i, userid);
    if (!requestingUserid) return er({ message: "You're not logged in" });
    return await deleteAllCommentsOfParent({ ...postContext({ $i, vars, seriesId }), userid: requestingUserid });
}

/** @param {object} context @returns {object} */
module.exports = ({ $i, userid }) => ({
    "/heichelos/:heichel/series/:series/post/:post/comments/aliases/:alias/sections": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await readAliasSections({ $i, vars, seriesId: vars.series, aliasId: vars.alias });
    },

    "/heichelos/:heichel/series/:series/post/:post/comments/aliases/:alias": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await readAliasComments({ $i, vars, seriesId: vars.series, aliasId: vars.alias });
    },

    "/heichelos/:heichel/series/:series/post/:post/comments/aliases": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await readAliases({ $i, vars, seriesId: vars.series });
    },

    "/heichelos/:heichel/post/:post/comments/aliases": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "Method Not Allowed", code: 405 });
        const seriesId = $i.$_GET.seriesId;
        const missing = needSeries($i.$_GET);
        if (missing) return missing;
        return await readAliases({ $i, vars, seriesId });
    },

    "/heichelos/:heichel/post/:post/comments/": async vars => await handlePostCommentCollection({ $i, userid, vars }),

    "/heichelos/:heichel/post/:post/comments/aliases/:alias": async vars => {
        if (methodIs($i, "GET")) {
            const seriesId = $i.$_GET.seriesId;
            if (!seriesId) return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
            if ($i.$_GET.verseSection !== undefined || $i.$_GET.idx !== undefined || $i.$_GET.all === "true") {
                return await readAliasComments({ $i, vars, seriesId, aliasId: vars.alias });
            }
            return await readAliasSections({ $i, vars, seriesId, aliasId: vars.alias });
        }
        if (methodIs($i, "POST")) return await addComment({ ...postContext({ $i, vars, seriesId: $i.$_POST.seriesId }), aliasId: vars.alias, userid });
        if (methodIs($i, "DELETE")) return await deleteAliasRoute({ $i, userid, vars });
        return er({ message: "Method Not Allowed", code: 405 });
    },

    ["/heichelos/:heichel/comments/inSeries/" + ":series/atPost/:post/atAlias/:alias"]: async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await readAliasComments({ $i, vars, seriesId: vars.series, aliasId: vars.alias });
    }
});

/** @param {object} params @returns {Promise<object>} */
async function deleteAliasRoute({ $i, userid, vars }) {
    const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId;
    if (!seriesId) return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
    const requestingUserid = getUserId($i, userid);
    if (!requestingUserid) return er({ message: "You're not logged in" });
    return await deleteAllCommentsOfAlias({ ...postContext({ $i, vars, seriesId }), aliasId: vars.alias, userid: requestingUserid });
}
