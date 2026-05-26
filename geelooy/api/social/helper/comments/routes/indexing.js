/*B"H*/

const {
    addCommentIndexToAlias,
    updateAllCommentIndexes
} = require("../index.js");

const { sp } = require("../../_awtsmoos.constants.js");
const { er, methodIs, getUserId } = require("./utils.js");

function safeKeys(value) {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return Object.keys(value).filter(key => key && !key.startsWith("$") && key !== "awtsmoosDayuh");
}

function flattenSeriesChain(node, trail = []) {
    if (!node || typeof node !== "object") return [];

    const records = [];
    if (node.seriesId || node.breadcrumb) {
        records.push({
            id: node.seriesId || trail[trail.length - 1] || "root",
            seriesId: node.seriesId || trail[trail.length - 1] || "root",
            breadcrumb: node.breadcrumb || trail.join("/"),
            path: trail.join("/")
        });
    }

    for (const key of safeKeys(node)) {
        if (key === "seriesId" || key === "breadcrumb" || key === "updatedAt") continue;
        records.push(...flattenSeriesChain(node[key], [...trail, key]));
    }

    return records;
}

module.exports = ({ $i, userid }) => ({
    "/aliases/:alias/commentsMade/heichelos": async vars => {
        const basePath = `${sp}/aliases/${vars.alias}/comments/heichel`;
        const index = await $i.db.get(basePath).catch(() => null);
        const heichelIds = safeKeys(index);

        return {
            success: heichelIds.map(id => ({
                id,
                name: id,
                kind: "comment-heichel"
            }))
        };
    },

    "/aliases/:alias/commentsMade/heichel/:heichel/series": async vars => {
        const basePath = `${sp}/aliases/${vars.alias}/comments/heichel/${vars.heichel}/seriesChain`;
        const index = await $i.db.get(basePath).catch(() => null);
        const series = flattenSeriesChain(index).map(record => ({
            ...record,
            name: record.breadcrumb || record.seriesId,
            kind: "comment-series"
        }));

        return { success: series };
    },

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
