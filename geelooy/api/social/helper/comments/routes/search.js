/*B"H*/

const {
    searchCommentSearchRecords
} = require("../commentAwtsmoosDbBridge.js");

const { er, methodIs } = require("./utils.js");

module.exports = ({ $i }) => ({
    "/heichelos/:heichel/comments/search": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        const query = $i.$_GET?.q || $i.$_GET?.query || "";
        const seriesId = $i.$_GET?.seriesId;
        if (!seriesId) return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
        return await searchCommentSearchRecords({
            $i,
            query,
            heichelId: vars.heichel,
            seriesId
        });
    }
});
