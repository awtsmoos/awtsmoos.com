// B"H
function silu(x){return x/(1+Math.exp(-x));}function siluMulInto(out,a,b){for(let i=0;i<a.length;i++)out[i]=silu(a[i])*b[i];return out;}module.exports={silu,siluMulInto};
