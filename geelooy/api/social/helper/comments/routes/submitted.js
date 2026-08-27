/*B"H*/

const {
    approveComment,
    denyComment,
    getSubmittedComments
} = require("../index.js");

const { er, methodIs } = require("./utils.js");

module.exports = ({ $i, userid }) => ({
    "/heichelos/:heichel/submittedComments": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "Method Not Allowed", code: 405 });
        return await getSubmittedComments({ heichelId: vars.heichel, $i });
    },

    "/heichelos/:heichel/submittedComments/approve": async vars => {
        const commentId = $i.$_POST.commentId || $i.$_GET.commentId;
        const aliasId = $i.$_POST.aliasId || $i.$_GET.aliasId;
        if (!commentId || !aliasId) return er({ message: "Need commentId and aliasId", code: "MISSING_ARGS" });
        if (!methodIs($i, "POST")) return er({ message: "Method Not Allowed", code: 405 });
        return await approveComment({ heichelId: vars.heichel, $i, userid, aliasId, commentId });
    },

    "/heichelos/:heichel/submittedComments/deny": async vars => {
        const commentId = $i.$_POST.commentId || $i.$_GET.commentId;
        const aliasId = $i.$_POST.aliasId || $i.$_GET.aliasId;
        if (!commentId || !aliasId) return er({ message: "Need commentId and aliasId", code: "MISSING_ARGS" });
        if (!methodIs($i, "POST")) return er({ message: "Method Not Allowed", code: 405 });
        return await denyComment({ heichelId: vars.heichel, $i, aliasId, userid, commentId });
    }
});
