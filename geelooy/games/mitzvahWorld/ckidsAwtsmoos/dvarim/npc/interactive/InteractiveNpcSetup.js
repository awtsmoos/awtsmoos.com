// B"H
/**
 * @file InteractiveNpcSetup.js
 * @description Birth and visual readiness helpers for friendly NPCs. Every NPC
 * receives explicit raycast, targeting, and dialogue metadata at setup time.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildGuideVisualFromRig } from "../guide/runtime/GuideVisualFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { applyNpcPalette } from "./InteractiveNpcPalette.js?compact=true&v=npc-split-20260628-bh1";
import {
  disposeVisual,
  hasVisibleRealMesh,
  hideCarrierMesh,
  sealNpcVisual
} from "./InteractiveNpcVisuals.js?compact=true&v=npc-split-20260628-bh1";
import { setStandingPose } from "./InteractiveNpcAnimation.js?compact=true&v=npc-split-20260628-bh1";

function friendlyFlags(npc) {
  return {
    friendly: true,
    friendlyNpc: true,
    npc: true,
    dialogueTarget: true,
    selectableTarget: true,
    interactable: true,
    interactionLabel: "Talk",
    targetName: npc?.name || "Friendly NPC",
    skipRaycast: false,
    skipOctree: true,
    noOctree: true
  };
}

function markNpcTree(root, npc, includeRoot = false) {
  root?.traverse?.(child => {
    if (!includeRoot && child === root) return;
    child.nivraAwtsmoos = npc;
    Object.assign(child.userData ||= {}, friendlyFlags(npc));
  });
}

function publishNpcDiag(olam) {
  if (!olam) return;
  globalThis.__MITZVAH_NPC_DIAG__ = () => {
    const all = (olam.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type));
    return {
      at: Date.now(),
      friendlyCount: all.length,
      targetableCount: all.filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length,
      selected: olam.__selectedFriendlyNpc?.name || null,
      lastClickedNPC: olam.__mitzvahNpcDiag?.lastClickedNpc || null,
      lastDialogueEvent: olam.__mitzvahNpcDiag?.lastDialogueEvent || null,
      setupSeal: "friendly-npc-click-target-talk-20260704"
    };
  };
}

export function installFallbackVisual(npc) {
  if (npc.realModelRequested) return;
  npc.guideVisualMesh = buildGuideVisualFromRig(npc.visualRig);
  sealNpcVisual(npc.guideVisualMesh, npc);
  markNpcTree(npc.guideVisualMesh, npc, true);
  npc.mesh.add(npc.guideVisualMesh);
}

export function registerInteractable(npc, olam) {
  if (!olam) return;
  if (!Array.isArray(olam.interactableNivrayim)) olam.interactableNivrayim = [];
  if (!olam.interactableNivrayim.includes(npc)) olam.interactableNivrayim.push(npc);
  publishNpcDiag(olam);
}

export function prepareNpcMesh(npc, olam) {
  if (!npc.mesh) npc.mesh = new THREE.Object3D();
  Object.assign(npc, {
    friendly: true,
    peaceful: true,
    interactable: true,
    interactionPrompt: "Talk",
    interactionLabel: "Talk"
  });
  Object.assign(npc.mesh.userData ||= {}, friendlyFlags(npc), {
    skipRaycast: true,
    awtsmoosVillageGuide: true,
    tapOnlyGuide: true
  });
  npc.mesh.nivraAwtsmoos = npc;
  sealNpcVisual(npc.mesh, npc);
  installFallbackVisual(npc);
  npc.mesh.add(npc.interactionMesh);
  markNpcTree(npc.interactionMesh, npc, true);
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
  markNpcTree(npc.modelMesh || npc.mesh, npc, true);
  resolveVisualBody(npc);
  setStandingPose(npc, true);
  publishNpcDiag(npc.olam);
  npc.heesHawveh = true;
}
