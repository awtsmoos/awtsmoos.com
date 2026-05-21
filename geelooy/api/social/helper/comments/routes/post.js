/*B"H*/

const {
    addComment,
    editComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent,
    getCommentsByAliasAtVerseSection,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsCommentingAtVerseSectionInParent
} = require("../index.js");

const { er, methodIs, body, getUserId } = require("./utils.js");

function needSeries(source) {
    return source?.seriesId ? null : er({ message: "Missing required parameter: seriesId", code: "MISSING_PARAMS" });
}

module.exports = ({ $i, userid }) => ({
    "/heichelos/:heichel/post/:post/comments/aliases": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "Method Not Allowed", code: 405 });
        const seriesId = $i.$_GET.seriesId;
        const missing = needSeries($i.$_GET);
        if (missing) return missing;
        return await getAuthorsCommentingAtVerseSectionInParent({
            $i,
            heichelId: vars.heichel,
            parentType: "post",
            parentId: vars.post,
            postId: vars.post,
            seriesId,
            verseSection: $i.$_GET.verseSection
        });
    },

    "/heichelos/:heichel/post/:post/comments/": async vars => {
        if (methodIs($i, "GET")) {
            return er({ BH: "B\"H", message: "Cannot GET all comments directly. Use aliases endpoints.", code: "WRONG_ENDPOINT" });
        }

        if (methodIs($i, "POST")) {
            const { seriesId, aliasId } = $i.$_POST;
            if (!seriesId) return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
            if (!aliasId) return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                userid,
                parentType: "post",
                seriesId,
                aliasId
            });
        }

        if (methodIs($i, "PUT")) {
            const { commentId, aliasId, seriesId, verseSection, content, dayuh } = $i.$_PUT;
            if (!commentId || !aliasId || !seriesId || verseSection === undefined) {
                return er({ message: "Missing required PUT parameters: commentId, aliasId, seriesId, verseSection", code: "MISSING_PARAMS" });
            }
            if (content === undefined && dayuh === undefined) return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
            return await editComment({
                $i,
                heichelId: vars.heichel,
                parentType: "post",
                parentId: vars.post,
                postId: vars.post,
                userid,
                commentId,
                aliasId,
                seriesId,
                verseSection,
                newContent: content,
                newDayuh: dayuh
            });
        }

        if (methodIs($i, "DELETE")) {
            const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId;
            if (!seriesId) return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
            const requestingUserid = getUserId($i, userid);
            if (!requestingUserid) return er({ message: "You're not logged in" });
            return await deleteAllCommentsOfParent({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                parentType: "post",
                seriesId,
                userid: requestingUserid
            });
        }

        return er({ message: "Method Not Allowed", code: 405 });
    },

    "/heichelos/:heichel/post/:post/comments/aliases/:alias": async vars => {
        if (methodIs($i, "GET")) {
            const seriesId = $i.$_GET.seriesId;
            if (!seriesId) return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
            return await getVerseSectionsCommentedByAuthorInParent({
                $i,
                aliasId: vars.alias,
                parentType: "post",
                parentId: vars.post,
                heichelId: vars.heichel,
                postId: vars.post,
                seriesId
            });
        }

        if (methodIs($i, "POST")) {
            const seriesId = $i.$_POST.seriesId;
            if (!seriesId) return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                aliasId: vars.alias,
                parentType: "post",
                userid,
                seriesId
            });
        }

        if (methodIs($i, "DELETE")) {
            const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId;
            if (!seriesId) return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
            const requestingUserid = getUserId($i, userid);
            if (!requestingUserid) return er({ message: "You're not logged in" });
            return await deleteAllCommentsOfAlias({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                aliasId: vars.alias,
                parentType: "post",
                userid: requestingUserid,
                seriesId
            });
        }

        return er({ message: "Method Not Allowed", code: 405 });
    },

    ["/heichelos/:heichel/comments/inSeries/" + ":series/atPost/:post/atAlias/:alias"]: async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await getCommentsByAliasAtVerseSection({
            $i,
            heichelId: vars.heichel,
            parentType: "post",
            parentId: vars.post,
            postId: vars.post,
            aliasId: vars.alias,
            verseSection: $i.$_GET.verseSection,
            seriesId: vars.series
        });
    }
});
