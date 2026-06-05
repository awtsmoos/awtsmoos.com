// B"H
/**
 * @file mouseRaycaster.js
 * @description
 * Chapter 134: Mobile taps find the proxy, not the robe.
 *
 * The phone route used `nivra.mesh || nivra.modelMesh`, ignoring `raycastMesh`.
 * The guide's real clickable vessel therefore existed but was invisible to the
 * tap beam. This rewrite uses a small explicit target resolver shared by all
 * interactables, sends the original click payload into `accepted interaction`,
 * and keeps hover from opening anything by itself.
 */
import * as THREE from '/games/scripts/build/three.module.js';

function targetFor(nivra) {
  if (!nivra) return null;
  if (nivra.raycastMesh) return nivra.raycastMesh;
  if (nivra.interactionMesh) return nivra.interactionMesh;
  return nivra.mesh || nivra.modelMesh || null;
}
function ownerFromHit(hit) {
  let cursor = hit?.object;
  while (cursor) {
    if (cursor.nivraAwtsmoos) return cursor.nivraAwtsmoos;
    cursor = cursor.parent;
  }
  return null;
}
function finitePayload(payload = {}) {
  return Number.isFinite(Number(payload.clientX)) && Number.isFinite(Number(payload.clientY));
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
    const rect = { width: this.olam.width || this.olam.renderer?.domElement?.clientWidth || 1, height: this.olam.height || this.olam.renderer?.domElement?.clientHeight || 1 };
    this.mouse.x = (Number(payload.clientX) / rect.width) * 2 - 1;
    this.mouse.y = -(Number(payload.clientY) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.olam.ayin.camera);

    const targets = (this.olam.interactableNivrayim || []).map(targetFor).filter(Boolean).filter(m => !m.userData?.skipRaycast);
    const intersects = this.raycaster.intersectObjects(targets, true);
    const hit = intersects[0] || null;
    const hitNivra = ownerFromHit(hit);

    if (hitNivra?.interactable) {
      if (this.currentHovered !== hitNivra) {
        if (this.currentHovered) this.currentHovered.ayshPeula("mouseLeave", { type: "hover-leave" });
        this.currentHovered = hitNivra;
        this.currentHovered.ayshPeula("mouseEnter", { type: "hover-enter" });
      }
      if (isClick) {
        hitNivra.ayshPeula("accepted interaction", {
          type: "click",
          explicit: true,
          isPointer: true,
          clientX: Number(payload.clientX),
          clientY: Number(payload.clientY),
          hitObjectName: hit?.object?.name
        });
      }
      return;
    }

    if (this.currentHovered) {
      this.currentHovered.ayshPeula("mouseLeave", { type: "hover-leave" });
      this.currentHovered = null;
    }
  }
}
