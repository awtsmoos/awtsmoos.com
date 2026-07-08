// B"H
/** @file TwoHandAnchorRuntime.js @description Records the left-hand IK target for great weapons while right hand owns the mesh. */
import { resolveHandBone } from "./HandBoneResolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { gripOffset } from "./GripOffsetCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function needsTwoHandAnchor(item={}){ return item.handedness==="two" || item.tags?.includes("held:twoHand") || ["greatSword","staff","bow","crossbow","hebrewBow","spear"].includes(item.genre); }
export class TwoHandAnchorRuntime{ constructor(runtime){ this.runtime=runtime; this.anchors=new Map(); } anchor({actorId,item,actorRoot}={}){ if(!needsTwoHandAnchor(item)) return {ok:true,needed:false,actorId,itemId:item?.id}; const left=resolveHandBone(actorRoot,"left"), offset=gripOffset(item?.grip); const record={ok:left.ok,needed:true,actorId,itemId:item?.id,leftHandName:left.name,leftHandStrategy:left.strategy,hint:offset.leftHandHint,ikReady:left.ok}; this.anchors.set(`${actorId}:${item?.id}`,record); this.runtime?.registerEntity?.({id:`twohand_${actorId}_${item?.id}`,kind:"twoHandAnchor",tags:["equipment","twoHand",item?.id],...record}); return record; } snapshot(){ return {count:this.anchors.size,anchors:[...this.anchors.values()]}; } }
export function createTwoHandAnchorRuntime(runtime){ return new TwoHandAnchorRuntime(runtime); }
export default createTwoHandAnchorRuntime;
