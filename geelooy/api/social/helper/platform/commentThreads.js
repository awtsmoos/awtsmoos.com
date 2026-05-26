//B"H
const { writePacked, listPackedRecords } = require('../packed/socialPacked.js');
const { logicalKey } = require('../packed/shardPaths.js');
function appendThreadComment({ $i, postId, commentId, parentId='', aliasId='', content='' }) { const comment={postId,commentId,parentId,aliasId,content,score:0,createdAt:Date.now()}; writePacked({$i,shard:'audit',key:logicalKey(['comments','threadEvents',postId,commentId]),value:comment,meta:{kind:'threadComment',postId,parentId}}); return comment; }
function rankedThread({ $i, postId }) { const comments=listPackedRecords({$i,shard:'audit'}).filter(r=>r.meta?.kind==='threadComment' && r.value?.postId===postId).map(r=>r.value); const replyCounts=new Map(); for(const c of comments) if(c.parentId) replyCounts.set(c.parentId,(replyCounts.get(c.parentId)||0)+1); return { postId, comments: comments.map(c=>({...c, rank:(replyCounts.get(c.commentId)||0)+(c.score||0)})).sort((a,b)=>b.rank-a.rank || a.createdAt-b.createdAt) }; }
module.exports={appendThreadComment, rankedThread};
