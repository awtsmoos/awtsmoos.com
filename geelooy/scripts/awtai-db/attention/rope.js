// B"H
function applyRopePair(vec,pos,headDim,base){for(let i=0;i<headDim;i+=2){const theta=Math.pow(base,-i/headDim);const c=Math.cos(pos*theta),s=Math.sin(pos*theta);for(let h=0;h<vec.length/headDim;h++){const o=h*headDim+i;const x=vec[o],y=vec[o+1];vec[o]=x*c-y*s;vec[o+1]=x*s+y*c;}}return vec;}module.exports={applyRopePair};
