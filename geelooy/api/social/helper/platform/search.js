//B"H
const { list, put, logicalKey } = require('./platformStore.js');
function tokens(text) { return String(text||'').toLowerCase().split(/[^a-z0-9_\u0590-\u05ff]+/).filter(Boolean).slice(0,80); }
function indexSearchDocument({ $i, domain='post', id, text='', entity={} }) {
  const toks = [...new Set(tokens(text))];
  const docs = [];
  for (const token of toks) {
    docs.push(put({ $i, shard:'search', parts:['search', domain, token, id], value:{ domain,id,token,text:String(text).slice(0,500),entity,score:1,updatedAt:Date.now() }, meta:{kind:'searchIndex',domain,token} }));
  }
  return { indexed: docs.length, tokens: toks };
}
function searchPacked({ $i, q='', domain='' }) {
  const toks = tokens(q);
  const scores = new Map();
  for (const record of list({ $i, shard:'search', predicate:r=>r.meta?.kind==='searchIndex' && (!domain || r.value?.domain===domain) && toks.includes(r.value?.token) })) {
    const cur = scores.get(record.value.id) || { ...record.value, score:0, matched:[] };
    cur.score += 1; cur.matched.push(record.value.token); scores.set(record.value.id, cur);
  }
  return [...scores.values()].sort((a,b)=>b.score-a.score);
}
module.exports = { indexSearchDocument, searchPacked, tokens };
