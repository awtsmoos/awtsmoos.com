// B"H
class Scheduler{constructor(manifest){this.manifest=manifest;this.cursor=0;}next(){return this.manifest.packets[this.cursor++]||null;}reset(){this.cursor=0;}plan(limit=8){return this.manifest.packets.slice(0,limit).map(p=>({id:p.id,stage:p.stage,layer:p.layer,count:p.tensors.length,prefetch:p.policy.prefetch}));}}
module.exports={Scheduler};
