// B"H
class TensorIndex{constructor(manifest){this.byName=new Map();this.byId=new Map();for(const t of manifest.tensors){this.byName.set(t.name,t);this.byId.set(t.id,t);}}name(n){return this.byName.get(n)||null;}id(i){return this.byId.get(i)||null;}role(role,layer=null){for(const t of this.byId.values())if(t.role===role&&(layer===null||t.layer===layer))return t;return null;}}
module.exports={TensorIndex};
