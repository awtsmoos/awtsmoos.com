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

export default class MouseInteractionHandler {
  constructor(olam) { this.olam = olam; this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2(); this.currentHovered = null; }
  update(payload = {}, isClick = false) {
    if (!this.olam.ayin?.camera || !finitePayload(payload)) return;
    const rect = viewportRect(this.olam);
    this.mouse.x = (Number(payload.clientX) / rect.width) * 2 - 1;
    this.mouse.y = -(Number(payload.clientY) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.olam.ayin.camera);
    const hit = this.raycaster.intersectObjects(raycastTargets(this.olam, "interaction"), false)[0] || null;
    const nivra = ownerFromHit(hit);
    if (!nivra?.interactable) { clearHover(this); clearEmptyClick(this, payload, isClick); return; }
    hover(this, nivra);
    if (!isClick) return;
    stopBrowserContext(payload);
    nivra.ayshPeula?.("accepted interaction", interactionPayload(payload, hit));
  }
}
