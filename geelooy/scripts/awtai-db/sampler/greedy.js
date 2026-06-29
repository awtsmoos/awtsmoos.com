// B"H
function greedy(logits){let bi=0,bv=-Infinity;for(let i=0;i<logits.length;i++){const v=logits[i];if(v>bv){bv=v;bi=i;}}return bi;}module.exports={greedy};
