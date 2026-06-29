// B"H
function rmsNormInto(out,x,w,eps){let ss=0;for(let i=0;i<x.length;i++)ss+=x[i]*x[i];const inv=1/Math.sqrt(ss/x.length+eps);for(let i=0;i<x.length;i++)out[i]=x[i]*inv*w[i];return out;}module.exports={rmsNormInto};
