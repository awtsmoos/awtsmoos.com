//B"H
const { put, get, list } = require('./platformStore.js');
function cacheGet({ $i, key }) { const record = get({ $i, shard:'feed', parts:['cache',key] })?.value; if (!record) return { error:{code:'CACHE_MISS'} }; if (record.invalidated) return { error:{code:'CACHE_INVALIDATED'} }; if (record.expiresAt && record.expiresAt < Date.now()) return { error:{code:'CACHE_EXPIRED'} }; return { success: record }; }
function cacheInvalidate({ $i, key }) { const record = { key, invalidated:true, expiresAt:0, updatedAt:Date.now() }; put({ $i, shard:'feed', parts:['cache',key], value:record, meta:{kind:'cache', invalidated:true} }); return record; }
function syncPull({ $i, aliasId, since = 0, limit = 100 }) { return { success: list({ $i, shard:'audit', predicate:r=>r.meta?.kind==='syncOp' && r.value?.aliasId===aliasId && Number(r.value?.createdAt || r.value?.updatedAt || 0)>Number(since||0) }).map(r=>r.value).sort((a,b)=>a.createdAt-b.createdAt).slice(0,limit), cursor: Date.now() }; }
module.exports = { cacheGet, cacheInvalidate, syncPull };
