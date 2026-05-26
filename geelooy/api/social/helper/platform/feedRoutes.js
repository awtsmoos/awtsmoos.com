//B"H
const { list, put, logicalKey } = require('./platformStore.js');
function postsFromIndex($i) { return list({ $i, shard:'search', predicate:r=>r.meta?.index==='postsByHeichel' }).map(r=>r.value); }
function feedHome({ $i, aliasId='', limit=50 }) { const posts = postsFromIndex($i).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,limit); return { kind:'home', aliasId, items:posts, generatedAt:Date.now() }; }
function feedHeichel({ $i, heichelId, limit=50 }) { const posts = postsFromIndex($i).filter(p=>!heichelId || p.heichelId===heichelId).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,limit); return { kind:'heichel', heichelId, items:posts, generatedAt:Date.now() }; }
function feedTrending({ $i, limit=50 }) { const counts = new Map(); for (const g of list({$i,shard:'graph',predicate:r=>r.recordType==='graphEdge'})) { const id=g.value?.to?.id || g.value?.from?.id; if(id) counts.set(id,(counts.get(id)||0)+1); } return { kind:'trending', items:[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id,score])=>({id,score})), generatedAt:Date.now() }; }
function feedDiscover({ $i, limit=50 }) { const posts = postsFromIndex($i).sort((a,b)=>String(a.postId).localeCompare(String(b.postId))).slice(0,limit); return { kind:'discover', items:posts, generatedAt:Date.now() }; }
module.exports = { feedHome, feedHeichel, feedTrending, feedDiscover };
