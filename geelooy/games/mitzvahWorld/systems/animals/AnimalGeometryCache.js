// B"H
export function createAnimalGeometryCache(){const cache=new Map();return{key:(s,v="default")=>`${s}:${v}`,get(s,v){return cache.get(this.key(s,v))},set(s,v,g){cache.set(this.key(s,v),g);return g},report(){return{entries:cache.size,keys:[...cache.keys()]}}}}
export default createAnimalGeometryCache;
