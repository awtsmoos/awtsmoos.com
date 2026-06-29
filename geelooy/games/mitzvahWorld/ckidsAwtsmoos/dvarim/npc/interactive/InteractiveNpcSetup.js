// B"H
/**
 * @file InteractiveNpcSetup.js
 * @description
 * Birth and visual readiness helpers for the interactive guide. The Awtsmoos
 * lets the class call clear verbs while the setup work rests here.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildGuideVisualFromRig } from "../guide/runtime/GuideVisualFactory.js";
import { applyNpcPalette } from "./InteractiveNpcPalette.js?v=npc-split-20260628-bh1";
import {
  disposeVisual,
  hasVisibleRealMesh,
  hideCarrierMesh,
  sealNpcVisual
} from "./InteractiveNpcVisuals.js?v=npc-split-20260628-bh1";
import { setStandingPose } from "./InteractiveNpcAnimation.js?v=npc-split-20260628-bh1";

export function installFallbackVisual(npc) {
  if (npc.realModelRequested) return;
  npc.guideVisualMesh = buildGuideVisualFromRig(npc.visualRig);
  sealNpcVisual(npc.guideVisualMesh, npc);
  npc.mesh.add(npc.guideVisualMesh);
}

export function registerInteractable(npc, olam) {
  const list = olam.interactableNivrayim;
  if (Array.isArray(list) && !list.includes(npc)) list.push(npc);
}

export function prepareNpcMesh(npc, olam) {
  if (!npc.mesh) npc.mesh = new THREE.Object3D();
  Object.assign(npc.mesh.userData ||= {}, {
    skipOctree: true,
    noOctree: true,
    skipRaycast: true,
    awtsmoosVillageGuide: true,
    tapOnlyGuide: true
  });
  npc.mesh.nivraAwtsmoos = npc;
  sealNpcVisual(npc.mesh, npc);
  installFallbackVisual(npc);
  npc.mesh.add(npc.interactionMesh);
  registerInteractable(npc, olam);
  npc.isReady = true;
}

export function resolveVisualBody(npc) {
  const hasReal = hasVisibleRealMesh(npc.modelMesh);
  const shouldRemoveFallback = (hasReal || npc.realModelRequested) && npc.guideVisualMesh;
  if (shouldRemoveFallback) {
    disposeVisual(npc.guideVisualMesh);
    npc.guideVisualMesh = null;
  } else if (npc.guideVisualMesh) {
    npc.guideVisualMesh.visible = true;
  }
  return hasReal;
}

export function readyNpcVisuals(npc) {
  sealNpcVisual(npc.modelMesh || npc.mesh, npc);
  hideCarrierMesh(npc.modelMesh);
  applyNpcPalette(npc.modelMesh, npc.options.palette || {});
  resolveVisualBody(npc);
  setStandingPose(npc, true);
  npc.heesHawveh = true;
}
