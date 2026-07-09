// B"H
/**
 * Door helpers: robust player/world positions and door state vessels.
 * The door must answer to the actual living chossid, whether the runtime stores
 * him as player.mesh, modelMesh, guf, collider.start, or a direct position.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { serialDoor } from "./DoorPersistence.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const TEMP = new THREE.Vector3();
export const playerEntity = olam => olam?.player || olam?.chossid || olam?.oyved || olam?.avatar || null;
function finiteVec(v){return v&&Number.isFinite(Number(v.x))&&Number.isFinite(Number(v.z));}
function cloneVec(v){return new THREE.Vector3(Number(v.x)||0,Number(v.y)||0,Number(v.z)||0);}
function worldFromObject(o){if(!o)return null;if(o.getWorldPosition)return o.getWorldPosition(new THREE.Vector3());if(finiteVec(o.position))return cloneVec(o.position);return null;}
export function playerPosition(olam){const p=playerEntity(olam);const direct=[p?.mesh,p?.modelMesh,p?.guf,p?.body,p?.visual,p?.root,p?.threeObject,p?.object3D,p];for(const item of direct){const v=worldFromObject(item);if(v)return v;}if(finiteVec(p?.collider?.start))return cloneVec(p.collider.start);if(finiteVec(p?.position))return cloneVec(p.position);if(finiteVec(olam?.camera?.position))return cloneVec(olam.camera.position);return null;}
export const toast=(olam,text,color="#ffe680")=>olam?.ayshPeula?.("ui event","effectsOverlay",{text,color,replace:true});
export const actionName=p=>typeof p==="string"?p:String(p?.type||p?.action||p?.peula||"");
export function dist2(a,b){if(!a||!b)return Infinity;const dx=a.x-b.x,dy=(a.y||0)-(b.y||0),dz=a.z-b.z;return dx*dx+dy*dy+dz*dz;}
export function doorEntries(root){const out=[];root?.traverse?.(c=>{if(c.userData?.doorHingePivot&&c.userData?.doorState)out.push({pivot:c,state:c.userData.doorState});});return out;}
export function worldPos(entry){return entry?.pivot?.getWorldPosition?entry.pivot.getWorldPosition(TEMP).clone():cloneVec(entry?.pivot?.position||{x:0,y:0,z:0});}
export function ensureInteractionArray(olam){if(!Array.isArray(olam.interactableNivrayim))olam.interactableNivrayim=[];return olam.interactableNivrayim;}
export function ensureGenericRegistry(olam){if(!Array.isArray(olam.__interactionRegistry))olam.__interactionRegistry=[];return olam.__interactionRegistry;}
export function publishDoorState(olam,state){const payload={type:"door",id:state.id,houseId:state.houseId,open:Boolean(state.open),locked:Boolean(state.locked),state:serialDoor(state)};olam?.liveBridge?.world?.setDoorOpen?.(state.id,payload.open);olam?.__liveBridge?.world?.setDoorOpen?.(state.id,payload.open);olam?.collisionWorld?.setDoorOpen?.(state.id,payload.open);olam?.world?.setDoorOpen?.(state.id,payload.open);olam?.ayshPeula?.("doorStateChanged",payload);if(olam)olam.__lastDoorStateChange={...payload,at:Date.now()};}
