// B"H
function softmaxInPlace(a){let m=-Infinity;for(const x of a)if(x>m)m=x;let s=0;for(let i=0;i<a.length;i++){a[i]=Math.exp(a[i]-m);s+=a[i];}for(let i=0;i<a.length;i++)a[i]/=s||1;return a;}module.exports={softmaxInPlace};
