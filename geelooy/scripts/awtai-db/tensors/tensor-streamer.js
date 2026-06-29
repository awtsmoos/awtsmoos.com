// B"H
const {dequant}=require('../math/dequant.js');const {elements}=require('./tensor-shape.js');
class TensorStreamer{constructor(file,stats){this.file=file;this.stats=stats;}raw(t){const b=this.file.tensorBytes(t);if(this.stats)this.stats.read(b.length,t.name);return b;}float(t){const b=this.raw(t);const v=dequant(b,t.type,elements(t));if(this.stats)this.stats.dequant(b.length,t.name);return v;}dispose(){}}
module.exports={TensorStreamer};
