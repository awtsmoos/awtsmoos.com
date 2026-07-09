// B"H
/**
 * @module SocialSearchRoutes
 * @description Exact Hebrew search remains, and a local llama RAG gate now
 * reveals live packed vector lanes: first list shards, then ask a query and get
 * scored hits plus the real comment rows from the packed comment database.
 */
const { er } = require('./helper/general.js');
const { searchExactHebrewWord, ROOTS, dbPath } = require('./helper/search/exactHebrewIndex.js');
const { availableShards } = require('./helper/search/rag/shards.js');
const { ragSearch } = require('./helper/search/rag/search.js');
const { ensureLlama } = require('./helper/search/rag/llama.js');
function query($i) { return $i.$_GET || {}; }
function body($i) { return $i.$_POST || {}; }
function data($i) { return { ...query($i), ...body($i) }; }
function requireGet($i) { return $i.request.method === 'GET' ? null : er({ code: 'BAD_METHOD', message: 'Use GET.' }); }
function intValue(value, fallback, max) { const n = Number(value ?? fallback); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback; }
function boolValue(value, fallback = true) { if (value == null) return fallback; return !['false', '0', 'no', 'off'].includes(String(value).toLowerCase()); }
async function safe(fn) { try { return await fn(); } catch (e) { return er({ code: e.code || 'RAG_SEARCH_ERROR', message: e.message, details: e.readiness || e.stack }); } }
function exactRoutes($i) { return {
  '/search/exact/hebrew': async () => {
    const bad = requireGet($i); if (bad) return bad;
    const q = query($i); const word = q.word || q.q || q.term;
    if (!word) return er({ code: 'MISSING_WORD', message: 'Pass ?word=אמר' });
    return { success: searchExactHebrewWord({ word, corpus: q.corpus || 'tanach', limit: intValue(q.limit, 25, 200), offset: intValue(q.offset, 0, 1000000) }) };
  },
  '/exact-text/hebrew/search': async () => {
    const bad = requireGet($i); if (bad) return bad;
    const q = query($i); const word = q.word || q.q || q.term;
    if (!word) return er({ code: 'MISSING_WORD', message: 'Pass ?word=אמר' });
    return { success: searchExactHebrewWord({ word, corpus: q.corpus || 'tanach', limit: intValue(q.limit, 25, 200), offset: intValue(q.offset, 0, 1000000) }) };
  },
  '/search/exact/hebrew/meta': async () => {
    const bad = requireGet($i); if (bad) return bad;
    return { success: { dbPath: dbPath(), corpora: ROOTS, searchTypes: ['exactWord', 'localRagVector'], futureSearchTypes: ['prefixLater', 'rootLater'] } };
  }
}; }
function ragRoutes($i) { return {
  '/search/rag/shards': async () => safe(async () => ({ success: await availableShards({ $i }) })),
  '/rag/search/shards': async () => safe(async () => ({ success: await availableShards({ $i }) })),
  '/search/rag/llama/status': async () => safe(async () => ({ success: await ensureLlama({ $i, autoInstall: false }) })),
  '/search/rag/query': async () => safe(async () => {
    const q = data($i), queryText = q.q || q.query || q.text;
    const result = await ragSearch({ $i, lane: q.shard || q.lane || q.corpus, query: queryText, limit: intValue(q.limit, 10, 50), includeComments: boolValue(q.comments, true), maxCommentRows: intValue(q.maxCommentRows, 12, 100), autoInstall: boolValue(q.autoInstall, true) });
    return { success: result };
  }),
  '/rag/search/query': async () => safe(async () => {
    const q = data($i), queryText = q.q || q.query || q.text;
    const result = await ragSearch({ $i, lane: q.shard || q.lane || q.corpus, query: queryText, limit: intValue(q.limit, 10, 50), includeComments: boolValue(q.comments, true), maxCommentRows: intValue(q.maxCommentRows, 12, 100), autoInstall: boolValue(q.autoInstall, true) });
    return { success: result };
  })
}; }
module.exports = ({ $i } = {}) => ({ ...exactRoutes($i), ...ragRoutes($i) });
