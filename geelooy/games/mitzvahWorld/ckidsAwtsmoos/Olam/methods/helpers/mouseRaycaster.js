// B"H
/**
 * @file mouseRaycaster.js
 * @description Pointer interaction uses explicit finite proxies. Empty clicks do
 * not erase a selected friendly NPC; only explicit target changes clear it.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=npc-target-final-20260708-bh3";
import { finitePayload, ownerFromHit, raycastTargets } from "./mouse/MouseRaycastTargets.js?compact=true&v=npc-target-final-20260708-bh3";
import { interactionPayload, stopBrowserContext } from "./mouse/MouseInteractionPayload.js?compact=true&v=npc-target-final-20260708-bh3";
function viewportRect(olam){return{width:olam.width||olam.renderer?.domElement?.clientWidth||1,height:olam.height||olam.renderer?.domElement?.clientHeight||1};}
function hover(handler,nivra){if(handler.currentHovered===nivra)return;handler.currentHovered?.ayshPeula?.("mouseLeave",{type:"hover-leave"});handler.currentHovered=nivra;nivra?.ayshPeula?.("mouseEnter",{type:"hover-enter"});}
function clearHover(handler){if(!handler.currentHovered)return;handler.currentHovered.ayshPeula?.("mouseLeave",{type:"hover-leave"});handler.currentHovered=null;}
function eventX(payload={}){return Number(payload.clientX??payload.x);}
function eventY(payload={}){return Number(payload.clientY??payload.y);}
function positionOf(nivra){return nivra?.raycastMesh?.getWorldPosition?nivra.raycastMesh.getWorldPosition(new THREE.Vector3()):nivra?.mesh?.position||nivra?.position||null;}
function projectedFallback(olam,pointer,camera){let best=null,bestScore=Infinity;const p=new THREE.Vector3();for(const nivra of olam?.interactableNivrayim||[]){if(!nivra?.interactable)continue;const pos=positionOf(nivra);if(!pos)continue;p.copy(pos).project(camera);if(p.z<-1||p.z>1)continue;const allowance=nivra.friendlyNpc?.valueOf?.()?0.42:nivra.type==="cottageDoor"?0.22:0.28,score=Math.hypot(p.x-pointer.x,p.y-pointer.y);if(score<allowance&&score<bestScore){best=nivra;bestScore=score;}}return best;}
export default class MouseInteractionHandler{constructor(olam){this.olam=olam;this.raycaster=new THREE.Raycaster();this.mouse=new THREE.Vector2();this.currentHovered=null;}update(payload={},isClick=false){if(!this.olam.ayin?.camera||!finitePayload(payload))return;const rect=viewportRect(this.olam);this.mouse.x=eventX(payload)/rect.width*2-1;this.mouse.y=-(eventY(payload)/rect.height)*2+1;this.raycaster.setFromCamera(this.mouse,this.olam.ayin.camera);const hit=this.raycaster.intersectObjects(raycastTargets(this.olam,"interaction"),false)[0]||null,nivra=ownerFromHit(hit)||projectedFallback(this.olam,this.mouse,this.olam.ayin.camera);if(!nivra?.interactable){clearHover(this);if(isClick)this.olam.__lastFriendlyNpcMissIgnored={at:Date.now(),selected:this.olam.__selectedFriendlyNpc?.name||null};return;}hover(this,nivra);if(!isClick)return;stopBrowserContext(payload);nivra.ayshPeula?.("accepted interaction",interactionPayload(payload,hit));}}
