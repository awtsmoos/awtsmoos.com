/*B"H*/

const {
    addCommentIndexToAlias,
    updateAllCommentIndexes
} = require("../index.js");

const { er, methodIs, getUserId } = require("./utils.js");

module.exports = ({ $i, userid }) => ({
    "/aliases/:alias/commentsMade/heichelos": async () => ({ success: [] }),

    "/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment": async vars => {
        if (!methodIs($i, "POST")) return er({ message: "POST only request", code: "POST_ONLY" });
        const seriesId = $i.$_POST.seriesId;
        if (!seriesId) return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
        return await addCommentIndexToAlias({
            $i,
            userid: getUserId($i, userid),
            aliasId: vars.alias,
            heichelId: vars.heichel,
            seriesId
        });
    },

    "/heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes": async vars => {
        if (!methodIs($i, "POST")) {
            return {
                message: "Use POST. Note: This endpoint is legacy and only kept for compatibility.",
                apiInfo: "Modern comment writes update indexes during creation."
            };
        }
        const requestingUserid = getUserId($i, userid);
        if (!requestingUserid) return er({ message: "You're not logged in" });
        return await updateAllCommentIndexes({
            $i,
            userid: requestingUserid,
            aliasId: vars.alias,
            heichelId: vars.heichel
        });
    }
});
