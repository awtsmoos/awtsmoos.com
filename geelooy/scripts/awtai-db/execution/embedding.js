// B"H
const {rowsCols}=require('../tensors/tensor-shape.js');
function embedding(streamer,t,token){const rc=rowsCols(t);const all=streamer.float(t);const start=token*rc.cols;return all.slice(start,start+rc.cols);}module.exports={embedding};
