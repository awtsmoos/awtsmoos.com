// B"H
/** @file ChossidWeaponAttachmentVerifier.js @description Verifies weapon attachment against real chossid.glb node names. */
import { CHOSSID_GLB_PATH } from "../../Olam/worlds/mitzvahWorld/npcs/ChossidGlbPath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { resolveHandBone } from "./HandBoneResolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function chossidBoneNamesFromDescriptor(descriptor={}){ return (descriptor.nodes||[]).map(n=>n.name).filter(Boolean); }
export function verifyChossidHands(descriptor={}){ const names=chossidBoneNamesFromDescriptor(descriptor); return {ok:names.includes("mixamorig:RightHand")&&names.includes("mixamorig:LeftHand"),url:CHOSSID_GLB_PATH,right:names.includes("mixamorig:RightHand"),left:names.includes("mixamorig:LeftHand"),count:names.length}; }
export function makeMockActorRootFromNames(names=[]){ const root={name:"chossidRoot",children:[],traverse(fn){ fn(this); for(const c of this.children) fn(c); }}; root.children=names.map(name=>({name,children:[],add(child){this.children.push(child); child.parent=this;}})); return root; }
export function verifyAttachmentRoots(actorRoot){ const right=resolveHandBone(actorRoot,"right"), left=resolveHandBone(actorRoot,"left"); return {ok:right.ok&&left.ok,right,left}; }
export default {verifyChossidHands,makeMockActorRootFromNames,verifyAttachmentRoots};
