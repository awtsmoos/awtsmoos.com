// B"H
/**
 * @file InteractiveNpcVisuals.js
 * @description
 * Visual sanctification for the guide. The Awtsmoos separates carrier, robe,
 * palette, and living mesh detection so the NPC class remains a conductor.
 */
import { isDrawableMaterial, shouldHideLivingNode } from "../../../Olam/worlds/mitzvahWorld/npcs/LivingModelSanitizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function fallbackRig(options = {}) {
  return options.visualRig || {
    kind: "fallback-guide",
    clothing: [
      { meshName: ["robe"], color: "#f7f2df" },
      { meshName: ["vest"], color: "#2f5fa8" },
      { meshName: ["belt"], color: "#6d4424" }
    ],
    face: {
      eyes: { irisColor: [0.08, 0.08, 0.08] },
      yarmulke: { color: "#101014" },
      beard: { colorTip: [0.44, 0.25, 0.12] }
    }
  };
}

export function sealNpcVisual(root, nivra) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = nivra;
    child.userData ||= {};

    const rayData = {
      skipRaycast: false,
      skipOctree: true,
      noOctree: true
    };
    const visualData = {
      skipRaycast: true,
      skipOctree: true,
      noOctree: true,
      isNpcVisual: true
    };

    Object.assign(child.userData, child.userData.awtsmoosRayProxy ? rayData : visualData);
  });
}

export function hideCarrierMesh(root) {
  root?.traverse?.(child => {
    const isCarrier = child?.name === "NPC_INVISIBLE_CARRIER";
    const isTiny = child?.geometry?.parameters?.width === 0.01;
    if (!isCarrier && !isTiny) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => {
      if (!material) return;
      material.transparent = true;
      material.opacity = 0;
      material.depthWrite = false;
      material.visible = true;
    });
  });
}

export function disposeVisual(root) {
  root?.traverse?.(child => {
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => material?.dispose?.());
  });
  root?.removeFromParent?.();
}

export function hasVisibleRealMesh(root) {
  let found = false;
  root?.traverse?.(child => {
    if (found || (!child?.isMesh && !child?.isSkinnedMesh)) return;
    if (child.userData?.isNpcVisual || child.name === "NPC_INVISIBLE_CARRIER") return;
    if (child.visible === false || shouldHideLivingNode(child)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const count = child.geometry?.attributes?.position?.count || child.geometry?.index?.count || 0;
    if (count > 0 && materials.some(isDrawableMaterial)) found = true;
  });
  return found;
}
