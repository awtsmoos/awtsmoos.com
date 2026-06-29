// B'H
export const MESH_RULES={letter:['letter',.7,1.5],bench:['box',1.4,.35],bush:['sphere',1,1],cedar:['tree',1.2,2.4],cart:['cylinder',1.3,.8],house:['box',1.8,1.6],arch:['arch',1.7,1.9],tower:['box',1.2,3.6],cloud:['sphere',2,.7],star:['star',1.5,1],gate:['ring',2.2,2.2]};
export function describeMesh(name){return MESH_RULES[name]||['box',1,1]}
export function shapeFor(name){return describeMesh(name)[0]}
export function scaledSize(name,r,h){const rule=describeMesh(name);return{sx:r*rule[1],sz:r*rule[1],h:h*rule[2]}}
