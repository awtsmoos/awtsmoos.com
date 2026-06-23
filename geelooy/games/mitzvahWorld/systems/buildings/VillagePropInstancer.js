// B"H
export function villagePropInstances(seed=1){return["barrel","crate","lamp","sign","fence-post","well-bucket"].map((kind,i)=>({kind,count:4+((seed+i*7)%9),instanced:true}))}
export default villagePropInstances;
