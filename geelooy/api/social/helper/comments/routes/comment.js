/*B"H*/

const {
    addComment,
    editComment,
    deleteComment,
    getComment,
    getCommentsByAliasAtVerseSection,
    getAuthorsCommentingAtVerseSectionInParent
} = require("../index.js");

const { er, methodIs, getUserId } = require("./utils.js");

module.exports = ({ $i, userid }) => ({
    ["/heichelos/:heichel/comments/inSeries/" + ":series/atPost/:post/atComment/:comment/" + "atAlias/:alias/atVerseSection/:verseSection"]: async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await getCommentsByAliasAtVerseSection({
            $i,
            heichelId: vars.heichel,
            parentType: "comment",
            postId: vars.post,
            parentId: vars.comment,
            aliasId: vars.alias,
            verseSection: vars.verseSection,
            seriesId: vars.series
        });
    },

    ["/heichelos/:heichel/comments/inSeries/" + ":series/atPost/:post/atComment/:comment/aliases"]: async vars => {
        if (!methodIs($i, "GET")) return er({ message: "Method Not Allowed", code: 405 });
        return await getAuthorsCommentingAtVerseSectionInParent({
            $i,
            parentType: "comment",
            parentId: vars.comment,
            heichelId: vars.heichel,
            seriesId: vars.series,
            postId: vars.post,
            verseSection: $i.$_GET.verseSection
        });
    },

    "/heichelos/:heichel/comment/:comment": async vars => {
        if (methodIs($i, "GET")) {
            const { aliasId, parentType, parentId, postId, seriesId, verseSection } = $i.$_GET;
            if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                return er({
                    message: "Cannot GET comment by ID alone. Full context required in GET parameters.",
                    details: "Need: aliasId, parentType, parentId, seriesId, verseSection, and postId if parentType='comment'",
                    code: "MISSING_CONTEXT"
                });
            }
            if (parentType === "comment" && !postId) return er({ message: "GET param postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
            return await getComment({
                $i,
                heichelId: vars.heichel,
                commentId: vars.comment,
                aliasId,
                parentType,
                parentId,
                postId,
                seriesId,
                verseSection
            });
        }

        if (methodIs($i, "POST")) {
            const { postId, seriesId, aliasId } = $i.$_POST;
            if (!postId || !seriesId) return er({ message: "Missing required POST parameters: postId, seriesId", code: "MISSING_PARAMS" });
            if (!aliasId) return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.comment,
                parentType: "comment",
                userid,
                postId,
                seriesId,
                aliasId
            });
        }

        if (methodIs($i, "DELETE")) {
            const incoming = $i.$_DELETE || $i.$_POST || {};
            const { aliasId, parentType, parentId, postId, seriesId, verseSection } = incoming;
            if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                return er({ message: "Missing required DELETE/POST parameters: aliasId, parentType, parentId, seriesId, verseSection", code: "MISSING_PARAMS" });
            }
            if (parentType === "comment" && !postId) return er({ message: "Parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
            const requestingUserid = getUserId($i, userid);
            if (!requestingUserid) return er({ message: "You're not logged in" });
            return await deleteComment({
                $i,
                heichelId: vars.heichel,
                userid: requestingUserid,
                commentId: vars.comment,
                aliasId,
                parentType,
                parentId,
                postId,
                seriesId,
                verseSection
            });
        }

        if (methodIs($i, "PUT")) {
            const { aliasId, parentType, parentId, postId, seriesId, verseSection, content, dayuh } = $i.$_PUT;
            if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                return er({ message: "Missing required PUT parameters: aliasId, parentType, parentId, seriesId, verseSection", code: "MISSING_PARAMS" });
            }
            if (parentType === "comment" && !postId) return er({ message: "Parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
            if (content === undefined && dayuh === undefined) return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
            const requestingUserid = getUserId($i, userid);
            if (!requestingUserid) return er({ message: "You're not logged in" });
            return await editComment({
                $i,
                heichelId: vars.heichel,
                userid: requestingUserid,
                commentId: vars.comment,
                aliasId,
                parentType,
                parentId,
                postId,
                seriesId,
                verseSection,
                newContent: content,
                newDayuh: dayuh
            });
        }

        return er({ message: "Method Not Allowed", code: 405 });
    },

    "/heichelos/:heichel/comments": async vars => {
        if (!methodIs($i, "POST")) return er({ message: "POST only endpoint", code: "METHOD_NOT_ALLOWED" });
        const { parentType, parentId, seriesId, aliasId, postId } = $i.$_POST;
        if (!parentType || !parentId || !seriesId) return er({ message: "Missing required POST parameters: parentType, parentId, seriesId", code: "MISSING_PARAMS" });
        if (parentType === "comment" && !postId) return er({ message: "POST parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
        if (!aliasId) return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
        return await addComment({
            $i,
            heichelId: vars.heichel,
            userid,
            parentType,
            parentId,
            postId,
            seriesId,
            aliasId
        });
    }
});
