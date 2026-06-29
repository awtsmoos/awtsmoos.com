// B"H
function zeros(n){return new Float32Array(n);} 
function copy(a){return new Float32Array(a);} 
function addInPlace(a,b){for(let i=0;i<a.length;i++)a[i]+=b[i];return a;} 
function mulInPlace(a,b){for(let i=0;i<a.length;i++)a[i]*=b[i];return a;} 
function siluInPlace(a){for(let i=0;i<a.length;i++){const x=a[i];a[i]=x/(1+Math.exp(-x));}return a;} 
function rmsNorm(x,w,eps){let ss=0;for(let i=0;i<x.length;i++)ss+=x[i]*x[i];const inv=1/Math.sqrt(ss/x.length+eps);const y=new Float32Array(x.length);for(let i=0;i<x.length;i++)y[i]=x[i]*inv*w[i];return y;} 
function argmax(a){let bi=0,bv=-Infinity;for(let i=0;i<a.length;i++){if(a[i]>bv){bv=a[i];bi=i;}}return bi;} 
module.exports={zeros,copy,addInPlace,mulInPlace,siluInPlace,rmsNorm,argmax};
