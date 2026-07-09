// B"H
import { accessorFloatArray } from './tiny-gltf-accessors.js';
import { lerpArray, quatSlerp } from './tiny-math.js';
import { resetTreeToBase } from './tiny-runtime.js';

/** Animation: time enters the bones, and the Awtsmoos says walk. */
const TARGET_SIZE={translation:3,rotation:4,scale:3,weights:1};
function sliceValue(arr,index,size){const out=[];for(let i=0;i<size;i++)out[i]=arr[index*size+i]??(size===4&&i===3?1:0);return out;}
function span(times,t){if(t<=times[0])return [0,0,0];const last=times.length-1;if(t>=times[last])return [last,last,0];let lo=0,hi=last;while(hi-lo>1){const mid=(lo+hi)>>1;if(times[mid]<=t)lo=mid;else hi=mid;}const f=(t-times[lo])/Math.max(1e-8,times[hi]-times[lo]);return [lo,hi,f];}
function setTarget(node,path,value){if(path==='translation')node.position.fromArray(value);else if(path==='rotation')node.quaternion.fromArray(value);else if(path==='scale')node.scale.fromArray(value);}
function sample(channel,t){const times=channel.input,values=channel.output,size=channel.size,[a,b,f]=span(times,t),step=channel.interpolation==='STEP'||a===b;if(channel.path==='rotation'){const qa=sliceValue(values,a,size),qb=sliceValue(values,b,size);return step?qa:quatSlerp(qa,qb,f);}const va=sliceValue(values,a,size),vb=sliceValue(values,b,size);return step?va:lerpArray(va,vb,f);}

export function summarizeAnimations(doc){return (doc.animations||[]).map((a,index)=>({index,name:a.name||`animation_${index}`,channels:(a.channels||[]).length,samplers:(a.samplers||[]).length,paths:[...new Set((a.channels||[]).map(c=>c.target?.path).filter(Boolean))]}));}

export function parseTinyAnimations(doc, accessors, nodeMap){
  return (doc.animations||[]).map((anim,index)=>{const channels=[];let duration=0;for(const ch of anim.channels||[]){const sampler=anim.samplers?.[ch.sampler],target=ch.target||{},node=nodeMap.get(target.node);if(!sampler||!node||!TARGET_SIZE[target.path])continue;const input=accessorFloatArray(accessors[sampler.input]),outAcc=accessors[sampler.output],output=accessorFloatArray(outAcc),size=TARGET_SIZE[target.path];duration=Math.max(duration,input[input.length-1]||0);channels.push({node,nodeIndex:target.node,path:target.path,input,output,size,interpolation:sampler.interpolation||'LINEAR'});}return{index,name:anim.name||`animation_${index}`,duration,channels};});
}

export class TinyAnimationPlayer{
  constructor(root,clips=[]){this.root=root;this.clips=clips;this.currentIndex=0;this.time=0;this.playing=true;this.bindPose=false;this.lastApplied='bind';}
  get current(){return this.clips[this.currentIndex]||null;}
  get names(){return this.clips.map(c=>c.name);}
  play(indexOrName){const i=typeof indexOrName==='number'?indexOrName:this.clips.findIndex(c=>c.name===indexOrName);if(i>=0){this.currentIndex=i;this.time=0;this.bindPose=false;this.apply(0);}return this.current;}
  next(){return this.play((this.currentIndex+1)%Math.max(1,this.clips.length));}
  setBindPose(on){this.bindPose=!!on;this.time=0;resetTreeToBase(this.root);this.lastApplied=this.bindPose?'bind':'reset';}
  update(dt){if(this.bindPose||!this.current){resetTreeToBase(this.root);return;}if(this.playing)this.time+=dt;const d=this.current.duration||1;this.apply(d?this.time%d:0);}
  apply(t){resetTreeToBase(this.root);const clip=this.current;if(!clip)return;for(const ch of clip.channels)setTarget(ch.node,ch.path,sample(ch,t));this.lastApplied=clip.name;}
  diagnostics(){const c=this.current;return{playing:this.playing,bindPose:this.bindPose,currentAnimation:c?.name||null,currentIndex:this.currentIndex,clipCount:this.clips.length,time:Number(this.time.toFixed(3)),duration:Number((c?.duration||0).toFixed(3)),channels:c?.channels.length||0};}
}
