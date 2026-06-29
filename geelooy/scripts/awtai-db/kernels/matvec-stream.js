// B"H
const {dequant}=require('../math/dequant.js');const {rowsCols}=require('../tensors/tensor-shape.js');
function matvecDequantized(weight,rows,cols,x){const out=new Float32Array(rows);for(let r=0;r<rows;r++){let s=0,base=r*cols;for(let c=0;c<cols;c++)s+=weight[base+c]*x[c];out[r]=s;}return out;}
function projectTensor(streamer,t,x,trace,label){const rc=rowsCols(t);if(trace)trace.mark('before-project-read-'+label);const raw=streamer.raw(t);if(trace)trace.mark('after-project-read-'+label);const w=dequant(raw,t.type,rc.rows*rc.cols);if(streamer.stats)streamer.stats.dequant(raw.length,t.name);if(trace)trace.mark('after-project-dequant-'+label);const y=matvecDequantized(w,rc.rows,rc.cols,x);if(trace)trace.mark('after-project-matvec-'+label);return y;}
module.exports={matvecDequantized,projectTensor};
