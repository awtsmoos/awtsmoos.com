// B"H
function matvec(x,w,rows,cols){const out=new Float32Array(rows);for(let r=0;r<rows;r++){let sum=0;const base=r*cols;for(let c=0;c<cols;c++)sum+=w[base+c]*x[c];out[r]=sum;}return out;}
module.exports={matvec};
