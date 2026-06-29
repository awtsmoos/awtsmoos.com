// B"H
function stageOf(t){if(t.role.startsWith('attn')||t.role==='norm')return'attention';if(t.role.startsWith('ffn'))return'ffn';return t.role;}
function makePackets(tensors){const map=new Map();for(const t of tensors){const key=(t.layer===null?'global':'layer-'+t.layer)+':'+stageOf(t);if(!map.has(key))map.set(key,{layer:t.layer,stage:stageOf(t),tensors:[]});map.get(key).tensors.push(t.id);}return Array.from(map.values()).map((p,id)=>({id,layer:p.layer,stage:p.stage,tensors:p.tensors,policy:{load:'range-read',execute:'runtime',discard:true,prefetch:id+1}}));}
module.exports={makePackets,stageOf};
