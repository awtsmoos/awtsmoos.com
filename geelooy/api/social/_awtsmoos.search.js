// B"H
/** Exact Hebrew, vector RAG, direct imported-comment, and range-comment routes. */
const { er } = require('./helper/general.js');
const { searchExactHebrewWord, ROOTS, dbPath } = require('./helper/search/exactHebrewIndex.js');
const { availableShards } = require('./helper/search/rag/shards.js');
const { ragSearch } = require('./helper/search/rag/search.js');
const { findCommentById, findCommentsForPostAlias, findAliasesForPost } = require('./helper/search/rag/comments.js');
const { ensureLlama } = require('./helper/search/rag/llama.js');
function query($i) { return $i.$_GET || {}; }
function body($i) { return $i.$_POST || {}; }
function data($i) { return { ...query($i), ...body($i) }; }
function intValue(value, fallback, max) { const n = Number(value ?? fallback); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback; }
function boolValue(value, fallback=true) { if (value == null) return fallback; return !['false','0','no','off'].includes(String(value).toLowerCase()); }
async function safe(fn) { try { return await fn(); } catch (e) { return er({ code:e.code || 'RAG_SEARCH_ERROR', message:e.message, details:e.readiness || e.stack }); } }
function exactRoutes($i) { return {
  '/search/exact/hebrew': async () => {
    if ($i.request.method !== 'GET') return er({ code:'BAD_METHOD', message:'Use GET.' });
    const q = query($i), word = q.word || q.q || q.term;
    if (!word) return er({ code:'MISSING_WORD', message:'Pass ?word=אמר' });
    return { success:searchExactHebrewWord({ word, corpus:q.corpus || 'tanach', limit:intValue(q.limit,25,200), offset:intValue(q.offset,0,1000000) }) };
  },
  '/search/exact/hebrew/meta': async () => ({ success:{ dbPath:dbPath(), corpora:ROOTS, searchTypes:['exactWord','localRagVector'] } })
}; }
function ragRoutes($i) { return {
  '/search/rag/shards': async () => safe(async () => ({ success:await availableShards({ $i }) })),
  '/rag/search/shards': async () => safe(async () => ({ success:await availableShards({ $i }) })),
  '/search/rag/llama/status': async () => safe(async () => ({ success:await ensureLlama({ $i, autoInstall:false }) })),
  '/search/rag/comments/:comment': async vars => safe(async () => {
    const q = data($i);
    if (!q.seriesId || !q.postId) return er({ code:'MISSING_CONTEXT', message:'Pass seriesId and postId.' });
    return await findCommentById({ $i, commentId:vars.comment, heichelId:q.heichelId || 'ikar', seriesId:q.seriesId, postId:q.postId });
  }),
  '/search/rag/post-comments': async () => safe(async () => {
    const q = data($i);
    if (!q.seriesId || !q.postId) return er({ code:'MISSING_CONTEXT', message:'Pass seriesId and postId.' });
    const context = { $i, heichelId:q.heichelId || 'ikar', seriesId:q.seriesId, postId:q.postId, verseSection:q.verseSection, subSection:q.subSection };
    if (q.aliasId) return { success:await findCommentsForPostAlias({ ...context, aliasId:q.aliasId }) };
    return { success:await findAliasesForPost(context) };
  }),
  '/search/rag/query': async () => safe(async () => {
    const q = data($i), queryText = q.q || q.query || q.text;
    return { success:await ragSearch({ $i, lane:q.shard || q.lane || q.corpus, query:queryText, limit:intValue(q.limit,10,50), includeComments:boolValue(q.comments,true), maxCommentRows:intValue(q.maxCommentRows,12,100), autoInstall:boolValue(q.autoInstall,true) }) };
  }),
  '/rag/search/query': async () => safe(async () => {
    const q = data($i), queryText = q.q || q.query || q.text;
    return { success:await ragSearch({ $i, lane:q.shard || q.lane || q.corpus, query:queryText, limit:intValue(q.limit,10,50), includeComments:boolValue(q.comments,true), maxCommentRows:intValue(q.maxCommentRows,12,100), autoInstall:boolValue(q.autoInstall,true) }) };
  })
}; }
module.exports = ({ $i } = {}) => ({ ...exactRoutes($i), ...ragRoutes($i) });
