// B"H
const {rmsNormInto}=require('../kernels/rms-norm.js');const {projectTensor}=require('../kernels/matvec-stream.js');
function logits(ctx,x){const {index,streamer,config,trace}=ctx;const w=streamer.float(index.name('output_norm.weight'));const h=new Float32Array(config.hidden);rmsNormInto(h,x,w,config.eps);return projectTensor(streamer,index.role('lm_head'),h,trace,'lm-head');}module.exports={logits};
