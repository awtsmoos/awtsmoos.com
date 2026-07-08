// B"H
/** @file InputInteract.js @description Door taps use fresh immediate door runtime; NPC X still talks. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=door-roof-target-20260708-bh2";
import { toggleNearestDoor } from "../../worlds/mitzvahWorld/region/houses/door/DoorInteractionRuntime.js?compact=true&v=door-wall-source-fix-20260708-bh4";
import { clearTarget } from "./InputTargeting.js?compact=true&v=door-roof-target-20260708-bh2";
import { nearPlayer, positionOf } from "./InputTrace.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const tmp=new THREE.Vector3();
function pos(entity){if(entity?.raycastMesh?.getWorldPosition)return entity.raycastMesh.getWorldPosition(tmp.clone());if(entity?.interactionMesh?.getWorldPosition)return entity.interactionMesh.getWorldPosition(tmp.clone());if(entity?.mesh?.getWorldPosition)return entity.mesh.getWorldPosition(tmp.clone());return positionOf(entity);}
function playerPos(olam){return pos(olam?.player||olam?.chossid);}
function dist(a,b){return a&&b&&a.distanceTo?a.distanceTo(b):Infinity;}
function source(peula={}){return String(peula.source||peula.type||"");}
function isDoorTap(peula={}){return /door|mobile-door-tap/i.test(source(peula));}
function isMobileTap(peula={}){return /mobile-tap|touchend|touch|pointer/i.test(source(peula))||peula.isTouch||peula.tap;}
function isDoor(nivra){return nivra?.type==="interactiveDoor"||nivra?.type==="cottageDoor"||nivra?.interactionKind==="door"||nivra?.doorState;}
function interactRouteDoor(olam,peula={}){const p=playerPos(olam);let best=null,bestD=Infinity;for(const nivra of olam.interactableNivrayim||[]){if(!isDoor(nivra))continue;const d=dist(p,pos(nivra));if(d<bestD){best=nivra;bestD=d;}}if(!best||bestD>Number(best.proximity||best.interactionRadius||10.5))return false;const result=best.ayshPeula?.("accepted interaction",{...(peula||{}),player:olam.player||olam.chossid,explicit:true,source:peula.source||"mobile-interact-nearest-door",distance:bestD,directDoor:true});olam.__lastDoorTapInteract={at:Date.now(),door:best.name||best.doorState?.id,distance:bestD,source:source(peula),result:Boolean(result)};return result!==false;}
function interactNpc(olam,peula={}){if(isDoorTap(peula))return false;const npc=olam?.__selectedFriendlyNpc;if(!npc||npc.interactable===false)return false;if(isMobileTap(peula)&&Date.now()-Number(npc.__lastPointerTargetAt||npc.__targetedAt||0)<220)return true;const actor={...(peula||{}),type:"contextmenu",contextMenu:true,explicit:true,isPointer:true,directHit:true,source:peula.source||"interact",player:olam.player||olam.chossid};if(!nearPlayer(olam,npc,Number(npc.talkDistance||npc.proximity||7)))return olam.ayshPeula?.("ui event","effectsOverlay",{text:"MOVE CLOSER TO TALK",color:"#ffd966"}),true;return npc.openGuideMenu?.(actor,true)||npc.ayshPeula?.("accepted interaction",actor)||true;}
export function interact(olam,peula={}){clearTarget(olam,isDoorTap(peula)?"door-not-combat":"interact-start");if(isDoorTap(peula)&&interactRouteDoor(olam,peula))return true;if(isDoorTap(peula)&&toggleNearestDoor(olam))return true;if(interactNpc(olam,peula))return true;if(interactRouteDoor(olam,peula))return true;if(toggleNearestDoor(olam))return true;olam.ayshPeula?.("ui event","effectsOverlay",{text:"NOTHING TO INTERACT",color:"#ffd966"});return false;}
export { toggleNearestDoor };
