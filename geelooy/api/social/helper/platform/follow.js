//B"H
const { put, list } = require('./platformStore.js');
const TYPES = new Set(['follow','mute','block','trust','subscribe']);
function setRelationship({ $i, fromAlias, toAlias, type='follow' }) {
  if (!TYPES.has(type)) return { error:{ code:'BAD_RELATIONSHIP', message:'Unsupported relationship.' } };
  const rel = { fromAlias, toAlias, type, createdAt: Date.now() };
  put({ $i, shard:'graph', parts:['relationships', type, fromAlias, toAlias], value:rel, meta:{kind:'relationship',type} });
  return { success: rel };
}
function listRelationships({ $i, aliasId, type='' }) {
  return { success: list({ $i, shard:'graph', predicate:r=>r.meta?.kind==='relationship' && r.value?.fromAlias===aliasId && (!type || r.value?.type===type) }).map(r=>r.value) };
}
module.exports = { setRelationship, listRelationships };
