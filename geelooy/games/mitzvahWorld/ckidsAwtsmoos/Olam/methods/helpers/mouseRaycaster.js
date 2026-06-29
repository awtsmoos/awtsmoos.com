// B"H
/**
 * @file mouseRaycaster.js
 * @description
 * Chapter 631: the raycaster is only a shliach. It aims, hovers, delivers
 * pointer intention, and now clears a friendly NPC target when an explicit click
 * lands on empty world instead of on a living speaker.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { clearFriendlyNpcTarget } from "../../../dvarim/npc/NpcTargetRuntime.js?v=npc-visible-target-20260628-bh1";
import {
  finitePayload,
  ownerFromHit,
  raycastTargets
} from "./mouse/MouseRaycastTargets.js?v=mouse-intent-split-20260628-bh1";
import {
  interactionPayload,
  stopBrowserContext
} from "./mouse/MouseInteractionPayload.js?v=mouse-intent-split-20260628-bh1";

function viewportRect(olam) {
  return {
    width: olam.width || olam.renderer?.domElement?.clientWidth || 1,
    height: olam.height || olam.renderer?.domElement?.clientHeight || 1
  };
}

function hover(handler, hitNivra) {
  if (handler.currentHovered === hitNivra) return;
  if (handler.currentHovered) {
    handler.currentHovered.ayshPeula("mouseLeave", { type: "hover-leave" });
  }
  handler.currentHovered = hitNivra;
  handler.currentHovered.ayshPeula("mouseEnter", { type: "hover-enter" });
}

function clearHover(handler) {
  if (!handler.currentHovered) return;
  handler.currentHovered.ayshPeula("mouseLeave", { type: "hover-leave" });
  handler.currentHovered = null;
}

function clearEmptyClick(handler, payload, isClick) {
  if (!isClick) return;
  stopBrowserContext(payload);
  clearFriendlyNpcTarget(handler.olam);
}

export default class MouseInteractionHandler {
  constructor(olam) {
    this.olam = olam;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.currentHovered = null;
  }

  update(payload = {}, isClick = false) {
    if (!this.olam.ayin?.camera || !finitePayload(payload)) return;

    const rect = viewportRect(this.olam);
    this.mouse.x = (Number(payload.clientX) / rect.width) * 2 - 1;
    this.mouse.y = -(Number(payload.clientY) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.olam.ayin.camera);

    const hit = this.raycaster.intersectObjects(raycastTargets(this.olam), true)[0] || null;
    const hitNivra = ownerFromHit(hit);
    if (!hitNivra?.interactable) {
      clearHover(this);
      clearEmptyClick(this, payload, isClick);
      return;
    }

    hover(this, hitNivra);
    if (!isClick) return;

    stopBrowserContext(payload);
    hitNivra.ayshPeula("accepted interaction", interactionPayload(payload, hit));
  }
}
