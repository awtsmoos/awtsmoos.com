// B"H
import { BufferAttribute } from './tiny-runtime.js';

/** Accessors: the hidden letters of GLTF made exact before the body moves. */
export const COMPONENTS={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
export const TYPE_SIZES={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
export function componentName(t){return ({5120:'BYTE',5121:'UNSIGNED_BYTE',5122:'SHORT',5123:'UNSIGNED_SHORT',5125:'UNSIGNED_INT',5126:'FLOAT'})[t]||String(t);}
export function normalizedScale(Ctor){if(Ctor===Int8Array)return 1/127;if(Ctor===Uint8Array)return 1/255;if(Ctor===Int16Array)return 1/32767;if(Ctor===Uint16Array)return 1/65535;return 1;}

function scalar(view,off,Ctor){if(Ctor===Float32Array)return view.getFloat32(off,true);if(Ctor===Uint32Array)return view.getUint32(off,true);if(Ctor===Uint16Array)return view.getUint16(off,true);if(Ctor===Uint8Array)return view.getUint8(off);if(Ctor===Int16Array)return view.getInt16(off,true);return view.getInt8(off);}
function writeTuple(target,index,values,itemSize){for(let k=0;k<itemSize;k++)target[index*itemSize+k]=values[k]??0;}

export function readAccessor(doc,buffers,index){
  const a=doc.accessors[index],Ctor=COMPONENTS[a?.componentType],itemSize=TYPE_SIZES[a?.type]||1;if(!a||!Ctor)throw new Error(`Unsupported accessor ${index}`);
  const normalized=a.normalized===true;let array;
  if(a.bufferView===undefined){array=new Ctor(a.count*itemSize);}else{
    const bv=doc.bufferViews[a.bufferView],buffer=buffers[bv.buffer],base=(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||Ctor.BYTES_PER_ELEMENT*itemSize;
    if(stride===Ctor.BYTES_PER_ELEMENT*itemSize){array=new Ctor(buffer,base,a.count*itemSize);}else{array=new Ctor(a.count*itemSize);const view=new DataView(buffer);for(let i=0;i<a.count;i++)for(let k=0;k<itemSize;k++)array[i*itemSize+k]=scalar(view,base+i*stride+k*Ctor.BYTES_PER_ELEMENT,Ctor);}
  }
  if(a.sparse){array=new Ctor(array);applySparse(doc,buffers,a,array,itemSize,Ctor);}
  const attr=new BufferAttribute(array,itemSize,normalized,a.componentType);attr.accessorIndex=index;attr.min=a.min;attr.max=a.max;return attr;
}

function applySparse(doc,buffers,a,array,itemSize,Ctor){
  const s=a.sparse,iv=doc.bufferViews[s.indices.bufferView],vv=doc.bufferViews[s.values.bufferView],ICtor=COMPONENTS[s.indices.componentType];
  const ib=buffers[iv.buffer],vb=buffers[vv.buffer],iBase=(iv.byteOffset||0)+(s.indices.byteOffset||0),vBase=(vv.byteOffset||0)+(s.values.byteOffset||0);
  const iView=new DataView(ib),vView=new DataView(vb);for(let n=0;n<s.count;n++){const idx=scalar(iView,iBase+n*ICtor.BYTES_PER_ELEMENT,ICtor),vals=[];for(let k=0;k<itemSize;k++)vals[k]=scalar(vView,vBase+(n*itemSize+k)*Ctor.BYTES_PER_ELEMENT,Ctor);writeTuple(array,idx,vals,itemSize);}
}

export function accessorFloatArray(attr){
  const src=attr.array;if(src instanceof Float32Array&&!attr.normalized)return src;const out=new Float32Array(src.length),scale=attr.normalized?normalizedScale(src.constructor):1;
  for(let i=0;i<src.length;i++){let v=src[i]*scale;if(attr.normalized&&(src instanceof Int8Array||src instanceof Int16Array))v=Math.max(-1,v);out[i]=v;}return out;
}

export function normalizeWeightsAttribute(attr){
  const src=accessorFloatArray(attr),out=new Float32Array(src.length),size=attr.itemSize;for(let i=0;i<attr.count;i++){let sum=0;for(let k=0;k<size;k++)sum+=Math.abs(src[i*size+k]||0);if(sum>0){for(let k=0;k<size;k++)out[i*size+k]=(src[i*size+k]||0)/sum;}else out[i*size]=1;}return new BufferAttribute(out,size,false,5126);
}

export function accessorSummary(doc,index){const a=doc.accessors[index];return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;}
