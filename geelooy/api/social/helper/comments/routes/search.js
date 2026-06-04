/*B"H*/
/**
 * @file routes/search.js
 * @chapter The Query Enters The Chamber
 * @description
 * Comment search endpoints. The vector chamber now awaits the direct Node GGUF
 * embedder, because true embeddings are born asynchronously: model may download,
 * the engine may awaken, and only then may the search speak.
 */

const { searchPackedComments, reindexPackedComments, commentSearchStats, embedderInfo } = require("../commentVectorSearch.js");
const { er, methodIs } = require("./utils.js");

/** @param {object} $i @param {string} fallback @returns {string} */
function query($i, fallback = "") {
    return $i.$_GET?.q || $i.$_GET?.query || $i.$_POST?.q || $i.$_POST?.query || fallback;
}

/** @param {object} $i @returns {number} */
function limit($i) {
    return Math.min(Number($i.$_GET?.limit || $i.$_POST?.limit || 20) || 20, 100);
}

/** @param {object} $i @returns {number} */
function rounds($i) {
    return Math.min(Number($i.$_GET?.rounds || $i.$_POST?.rounds || 50) || 50, 500);
}

/** @param {object} params @returns {Promise<object>} */
async function doSearch({ $i, vars, mode }) {
    const seriesId = $i.$_GET?.seriesId || $i.$_POST?.seriesId;
    if (!seriesId) return er({ message: "Missing required parameter: seriesId", code: "MISSING_PARAMS" });
    return await searchPackedComments({ $i, heichelId: vars.heichel, seriesId, query: query($i), mode, limit: limit($i) });
}

/** @param {object} params @returns {Promise<object>} */
async function stressSearch({ $i, vars }) {
    const seriesId = $i.$_GET?.seriesId || $i.$_POST?.seriesId;
    if (!seriesId) return er({ message: "Missing required parameter: seriesId", code: "MISSING_PARAMS" });
    const startedAt = Date.now();
    const samples = [];
    for (let i = 0; i < rounds($i); i++) {
        const res = await searchPackedComments({ $i, heichelId: vars.heichel, seriesId, query: query($i, "comment"), mode: i % 2 ? "vector" : "hybrid", limit: limit($i) });
        if (i < 5) samples.push({ i, count: res.success.length, topScore: res.success[0]?.score || 0, realEmbedding: Boolean(res.success[0]?.realEmbedding) });
    }
    return { success: true, rounds: rounds($i), ms: Date.now() - startedAt, samples, embedder: embedderInfo() };
}

module.exports = ({ $i }) => ({
    "/heichelos/:heichel/comments/search": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await doSearch({ $i, vars, mode: $i.$_GET?.mode || "hybrid" });
    },

    "/heichelos/:heichel/comments/search/vector": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await doSearch({ $i, vars, mode: "vector" });
    },

    "/heichelos/:heichel/comments/search/lexical": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        return await doSearch({ $i, vars, mode: "lexical" });
    },

    "/heichelos/:heichel/comments/search/stats": async vars => {
        if (!methodIs($i, "GET")) return er({ message: "GET only request", code: "GET_ONLY" });
        const seriesId = $i.$_GET?.seriesId;
        if (!seriesId) return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
        return commentSearchStats({ $i, heichelId: vars.heichel, seriesId });
    },

    "/heichelos/:heichel/comments/search/reindex": async vars => {
        if (!methodIs($i, "POST")) return er({ message: "POST only request", code: "POST_ONLY" });
        const seriesId = $i.$_POST?.seriesId || $i.$_GET?.seriesId;
        if (!seriesId) return er({ message: "Missing required parameter: seriesId", code: "MISSING_PARAMS" });
        return await reindexPackedComments({ $i, heichelId: vars.heichel, seriesId });
    },

    "/heichelos/:heichel/comments/search/stress": async vars => {
        if (!methodIs($i, "GET") && !methodIs($i, "POST")) return er({ message: "GET or POST only request", code: "METHOD_NOT_ALLOWED" });
        return await stressSearch({ $i, vars });
    }
});
