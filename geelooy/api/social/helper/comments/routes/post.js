/*B"H*/
/**
 * @file routes/post.js
 * @chapter The Comment Gate Stopped Mistaking Silence For Root
 * @description
 * Post-comment routes preserve the old API shape while reading through DosDB,
 * whose heichel paths now prefer family AwtsmoosDB files. A missing verse query
 * now means "all sections" for alias/commentator discovery. Only explicit
 * `verseSection`, `idx`, or write bodies choose a concrete section.
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

function seriesFrom(source = {}) {
    return source.seriesId || source.series || "root";
}

function needWriteSeries(source, method) {
    return source?.seriesId || source?.series ? null : er({ message: `Missing required ${method} parameter: seriesId`, code: "MISSING_PARAMS" });
}

function verse($i) {
    const value = $i.$_GET?.verseSection ?? $i.$_GET?.idx;
    return value === "" || value === null ? undefined : value;
}

function postContext({ $i, vars, seriesId }) {
    return { $i, heichelId: vars.heichel, parentType: "post", parentId: vars.post, postId: vars.post, seriesId };
}

async function readAliases({ $i, vars, seriesId }) {
    return await getAuthorsCommentingAtVerseSectionInParent({ ...postContext({ $i, vars, seriesId }), verseSection: verse($i) });
}

async function readAliasSections({ $i, vars, seriesId, aliasId }) {
    return await getVerseSectionsCommentedByAuthorInParent({ ...postContext({ $i, vars, seriesId }), aliasId });
}

async function readAliasComments({ $i, vars, seriesId, aliasId }) {
    const v = verse($i);
    if (v === undefined || $i.$_GET?.all === "true") return await getAllCommentsByAliasInParent({ ...postContext({ $i, vars, seriesId }), aliasId });
    return await getCommentsByAliasAtVerseSection({ ...postContext({ $i, vars, seriesId }), aliasId, verseSection: v });
}

async function handlePostCommentCollection({ $i, userid, vars }) {
    if (methodIs($i, "GET")) return await readPostCommentGet({ $i, vars });
    if (methodIs($i, "POST")) return await createPostComment({ $i, userid, vars });
    if (methodIs($i, "PUT")) return await updatePostComment({ $i, userid, vars });
    if (methodIs($i, "DELETE")) return await deletePostComments({ $i, userid, vars });
    return er({ message: "Method Not Allowed", code: 405 });
}

async function readPostCommentGet({ $i, vars }) {
    const seriesId = seriesFrom($i.$_GET);
    if ($i.$_GET.aliasId) return await readAliasComments({ $i, vars, seriesId, aliasId: $i.$_GET.aliasId });
    return await readAliases({ $i, vars, seriesId });
}

async function createPostComment({ $i, userid, vars }) {
    const { aliasId } = $i.$_POST;
    const missing = needWriteSeries($i.$_POST, "POST");
    if (missing) return missing;
    if (!aliasId) return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
    return await addComment({ ...postContext({ $i, vars, seriesId: seriesFrom($i.$_POST) }), userid, aliasId });
}

async function updatePostComment({ $i, userid, vars }) {
    const { commentId, aliasId, verseSection, content, dayuh } = $i.$_PUT;
    const missing = needWriteSeries($i.$_PUT, "PUT");
    if (!commentId || !aliasId || verseSection === undefined) return er({ message: "Missing required PUT parameters: commentId, aliasId, verseSection", code: "MISSING_PARAMS" });
    if (missing) return missing;
    if (content === undefined && dayuh === undefined) return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
    return await editComment({ ...postContext({ $i, vars, seriesId: seriesFrom($i.$_PUT) }), userid, commentId, aliasId, verseSection, newContent: content, newDayuh: dayuh });
}

async function deletePostComments({ $i, userid, vars }) {
    const incoming = $i.$_DELETE || $i.$_POST || {};
    const missing = needWriteSeries(incoming, "DELETE/POST");
    if (missing) return missing;
    const requestingUserid = getUserId($i, userid);
    if (!requestingUserid) return er({ message: "You're not logged in" });
    return await deleteAllCommentsOfParent({ ...postContext({ $i, vars, seriesId: seriesFrom(incoming) }), userid: requestingUserid });
}

async function deleteAliasRoute({ $i, userid, vars }) {
    const incoming = $i.$_DELETE || $i.$_POST || {};
    const missing = needWriteSeries(incoming, "DELETE/POST");
    if (missing) return missing;
    const requestingUserid = getUserId($i, userid);
    if (!requestingUserid) return er({ message: "You're not logged in" });
    return await deleteAllCommentsOfAlias({ ...postContext({ $i, vars, seriesId: seriesFrom(incoming) }), aliasId: vars.alias, userid: requestingUserid });
}

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
        return await readAliases({ $i, vars, seriesId: seriesFrom($i.$_GET) });
    },

    "/heichelos/:heichel/post/:post/comments/": async vars => await handlePostCommentCollection({ $i, userid, vars }),

    "/heichelos/:heichel/post/:post/comments/aliases/:alias": async vars => {
        if (methodIs($i, "GET")) {
            const seriesId = seriesFrom($i.$_GET);
            if ($i.$_GET.verseSection !== undefined || $i.$_GET.idx !== undefined || $i.$_GET.all === "true") return await readAliasComments({ $i, vars, seriesId, aliasId: vars.alias });
            return await readAliasSections({ $i, vars, seriesId, aliasId: vars.alias });
        }
        if (methodIs($i, "POST")) return await addComment({ ...postContext({ $i, vars, seriesId: seriesFrom($i.$_POST) }), aliasId: vars.alias, userid });
        if (methodIs($i, "DELETE")) return await deleteAliasRoute({ $i, userid, vars });
        return er({ message: "Method Not Allowed", code: 405 });
    },

    ["/heichelos/:heichel/comments/inSeries/" + ":series/atPost/:post/atAlias/:alias"]: async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await readAliasComments({ $i, vars, seriesId: vars.series, aliasId: vars.alias });
    }
});
