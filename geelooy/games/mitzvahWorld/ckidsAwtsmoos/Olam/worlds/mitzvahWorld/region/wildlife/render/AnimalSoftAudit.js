// B"H
/**
 * @file AnimalSoftAudit.js
 * @description
 * The audit angel records truth without destroying life. The Awtsmoos lets
 * wildlife remain visible even when a binding warning appears.
 */
import { assertAnimalRenderable } from "../skinned/AnimalRenderableAudit.js?v=single-mesh-animals-20260621-bh1";

export function countMeshes(root) {
  let count = 0;
  root?.traverse?.(child => {
    if (child?.isMesh || child?.isSkinnedMesh) count += 1;
  });
  return count;
}

function warningAudit(mesh, error) {
  const data = mesh?.userData || {};
  const geometry = mesh?.geometry || {};
  const position = geometry.attributes?.position;
  const indexedTriangles = geometry.index?.count ? Math.floor(geometry.index.count / 3) : null;

  console.warn("B\"H animal renderable audit softened so wildlife still spawns", {
    name: mesh?.name,
    message: error?.message || String(error)
  });

  return {
    roots: 1,
    skinnedMeshes: mesh?.isSkinnedMesh ? 1 : 0,
    clips: data.clipCount || 0,
    missingSkinAttributes: geometry.attributes?.skinIndex && geometry.attributes?.skinWeight ? 0 : 1,
    backend: data.renderBackend || null,
    hasSkeleton: Boolean(mesh?.skeleton),
    isSkinnedMesh: Boolean(mesh?.isSkinnedMesh),
    mixerTarget: data.animationMixerTarget || "root-fallback",
    bindingUnsafe: true,
    warningOnly: true,
    message: error?.message || String(error),
    vertexCount: position?.count || 0,
    triangleCount: indexedTriangles ?? Math.floor((position?.count || 0) / 3)
  };
}

export function softAuditAnimal(mesh) {
  try {
    return assertAnimalRenderable(mesh);
  } catch (error) {
    return warningAudit(mesh, error);
  }
}
