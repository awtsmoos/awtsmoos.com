// B"H
import { identity, inverse, mat4FromArray, multiply } from './tiny-math.js';

/** Skeletons: the joint letters bind the garment to the living hierarchy. */
export const MAX_TINY_JOINTS = 96;

export class TinySkeleton{
  constructor({skinIndex,skinDef,nodeMap,inverseBindAccessor}){this.skinIndex=skinIndex;this.name=skinDef.name||`skin_${skinIndex}`;this.jointNodeIndices=skinDef.joints||[];this.joints=this.jointNodeIndices.map(i=>nodeMap.get(i));this.inverseBindMatrices=this.jointNodeIndices.map((_,i)=>inverseBindAccessor?mat4FromArray(inverseBindAccessor.array,i*16):identity());this.jointCount=this.jointNodeIndices.length;this.jointMatrices=new Float32Array(Math.max(1,this.jointCount)*16);this.resetPalette();}
  resetPalette(){for(let i=0;i<Math.max(1,this.jointCount);i++)this.jointMatrices.set(identity(),i*16);}
  update(meshWorld,worldByNode){const invMesh=inverse(meshWorld),count=Math.min(this.jointCount,MAX_TINY_JOINTS);for(let i=0;i<count;i++){const jw=worldByNode.get(this.jointNodeIndices[i])||this.joints[i]?.matrixWorld||identity();this.jointMatrices.set(multiply(invMesh,multiply(jw,this.inverseBindMatrices[i]||identity())),i*16);}return count;}
}

export function collectWorldMatrices(root){root.updateWorldMatrix(identity());const map=new Map();root.traverse(o=>{if(o.userData?.nodeIndex!==undefined)map.set(o.userData.nodeIndex,o.matrixWorld);});return map;}

export function bindTinySkeletons(root,doc,accessors){
  const nodeMap=root.userData.nodeMap,skeletons=new Map();let maxJoints=0,missingJoints=0;
  (doc.skins||[]).forEach((skinDef,skinIndex)=>{const inv=skinDef.inverseBindMatrices!==undefined?accessors[skinDef.inverseBindMatrices]:null;const skel=new TinySkeleton({skinIndex,skinDef,nodeMap,inverseBindAccessor:inv});missingJoints+=skel.joints.filter(j=>!j).length;maxJoints=Math.max(maxJoints,skel.jointCount);skeletons.set(skinIndex,skel);});
  let skinnedMeshes=0,rigidMeshes=0;root.traverse(obj=>{if(!obj.isMesh)return;const hasSkin=obj.skinIndex!==null&&obj.skinIndex!==undefined;const hasAttrs=!!(obj.geometry?.attributes?.joints&&obj.geometry?.attributes?.weights);obj.skeleton=hasSkin?skeletons.get(obj.skinIndex):null;obj.isSkinnedMesh=!!(obj.skeleton&&hasAttrs);if(obj.isSkinnedMesh)skinnedMeshes++;else rigidMeshes++;});
  root.userData.skeletons=skeletons;return{skeletonCount:skeletons.size,skinnedMeshes,rigidMeshes,maxJoints,missingJoints};
}

export function updateTinySkeletons(root){const world=collectWorldMatrices(root);let skinnedMeshes=0,jointsUploaded=0;root.traverse(obj=>{if(!obj.isSkinnedMesh||!obj.skeleton)return;skinnedMeshes++;jointsUploaded+=obj.skeleton.update(obj.matrixWorld||identity(),world);});return{skinnedMeshes,jointsUploaded};}

export function setMeshKindVisibility(root,{skinned=true,rigid=true}={}){root.traverse(o=>{if(!o.isMesh)return;o.visible=o.isSkinnedMesh?skinned:rigid;});}

export function skeletonLinePositions(root){const out=[];const skels=root.userData?.skeletons||new Map();for(const skel of skels.values()){const jointSet=new Set(skel.joints.filter(Boolean));for(const joint of jointSet){const p=joint.parent;if(!p||!jointSet.has(p))continue;out.push(p.matrixWorld[12],p.matrixWorld[13],p.matrixWorld[14],joint.matrixWorld[12],joint.matrixWorld[13],joint.matrixWorld[14]);}}return new Float32Array(out);}
