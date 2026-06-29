// B"H
function softmaxTop(logits, ids) {let m=-Infinity;for(const id of ids) if(logits[id]>m)m=logits[id];let s=0;const ps=[];for(const id of ids){const p=Math.exp(logits[id]-m);ps.push([id,p]);s+=p;}return ps.map(([id,p])=>[id,p/(s||1)]);} 
function topP(logits, p=0.9, limit=64) {const ids=[...logits.keys()].sort((a,b)=>logits[b]-logits[a]).slice(0,limit);const probs=softmaxTop(logits,ids).sort((a,b)=>b[1]-a[1]);let total=0,out=[];for(const x of probs){out.push(x);total+=x[1];if(total>=p)break;}return out;}
module.exports={topP};
