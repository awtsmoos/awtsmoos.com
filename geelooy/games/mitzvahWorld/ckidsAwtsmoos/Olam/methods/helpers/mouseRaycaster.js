// B"H
/**
 * @file mouseRaycaster.js
 * @description Pointer interaction uses explicit finite proxies. Empty clicks
 * clear friendly targets only after a true safe miss.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { clearFriendlyNpcTarget } from "../../../dvarim/npc/NpcTargetRuntime.js?v=npc-visible-target-20260628-bh1";
import { finitePayload, ownerFromHit, raycastTargets } from "./mouse/MouseRaycastTargets.js?v=reality-raycast-20260629-bh1";
import { interactionPayload, stopBrowserContext } from "./mouse/MouseInteractionPayload.js?v=mouse-intent-split-20260628-bh1";

function viewportRect(olam) { return { width:olam.width || olam.renderer?.domElement?.clientWidth || 1, height:olam.height || olam.renderer?.domElement?.clientHeight || 1 }; }
function hover(handler, nivra) { if (handler.currentHovered === nivra) return; handler.currentHovered?.ayshPeula?.("mouseLeave", { type:"hover-leave" }); handler.currentHovered = nivra; nivra?.ayshPeula?.("mouseEnter", { type:"hover-enter" }); }
function clearHover(handler) { if (!handler.currentHovered) return; handler.currentHovered.ayshPeula?.("mouseLeave", { type:"hover-leave" }); handler.currentHovered = null; }
function clearEmptyClick(handler, payload, isClick) { if (!isClick) return; stopBrowserContext(payload); clearFriendlyNpcTarget(handler.olam); }
function eventX(payload = {}) { return Number(payload.clientX ?? payload.x); }
function eventY(payload = {}) { return Number(payload.clientY ?? payload.y); }
function positionOf(nivra) { return nivra?.raycastMesh?.getWorldPosition ? nivra.raycastMesh.getWorldPosition(new THREE.Vector3()) : nivra?.mesh?.position || nivra?.position || null; }
function projectedFallback(olam, pointer, camera) {
  let best = null, bestScore = Infinity;
  const p = new THREE.Vector3();
  for (const nivra of olam?.interactableNivrayim || []) {
    if (!nivra?.interactable) continue;
    const pos = positionOf(nivra);
    if (!pos) continue;
    p.copy(pos).project(camera);
    if (p.z < -1 || p.z > 1) continue;
    const allowance = nivra.type === "cottageDoor" ? 0.22 : 0.28;
    const score = Math.hypot(p.x - pointer.x, p.y - pointer.y);
    if (score < allowance && score < bestScore) { best = nivra; bestScore = score; }
  }
  return best;
}

export default class MouseInteractionHandler {
  constructor(olam) { this.olam = olam; this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2(); this.currentHovered = null; }
  update(payload = {}, isClick = false) {
    if (!this.olam.ayin?.camera || !finitePayload(payload)) return;
    const rect = viewportRect(this.olam);
    this.mouse.x = (eventX(payload) / rect.width) * 2 - 1;
    this.mouse.y = -(eventY(payload) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.olam.ayin.camera);
    const hit = this.raycaster.intersectObjects(raycastTargets(this.olam, "interaction"), false)[0] || null;
    const nivra = ownerFromHit(hit) || projectedFallback(this.olam, this.mouse, this.olam.ayin.camera);
    if (!nivra?.interactable) { clearHover(this); clearEmptyClick(this, payload, isClick); return; }
    hover(this, nivra);
    if (!isClick) return;
    stopBrowserContext(payload);
    nivra.ayshPeula?.("accepted interaction", interactionPayload(payload, hit));
  }
}
