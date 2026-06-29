// B"H
function topK(logits,k){const arr=[];for(let i=0;i<logits.length;i++)arr.push([logits[i],i]);arr.sort((a,b)=>b[0]-a[0]);return arr.slice(0,k).map(x=>({id:x[1],logit:x[0]}));}module.exports={topK};
