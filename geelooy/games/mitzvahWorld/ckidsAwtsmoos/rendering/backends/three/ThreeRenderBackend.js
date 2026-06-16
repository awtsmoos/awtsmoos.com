// B"H
/** @file ThreeRenderBackend.js @description Current concrete backend; the only animal path that touches Three. */
import RenderBackend from "../../RenderBackend.js";
import { createThreeGeometry } from "./ThreeGeometryAdapter.js";
import { createThreeSkeleton } from "./ThreeSkeletonAdapter.js";
import { createThreeMaterial } from "./ThreeMaterialAdapter.js";
import { createThreeTexture } from "./ThreeTextureAdapter.js";
import { createThreeSkinnedMesh } from "./ThreeSkinnedMeshAdapter.js";
import { createThreeClip, createThreeMixer } from "./ThreeAnimationAdapter.js";
import { createThreeGroup, createThreeMesh, markThree } from "./ThreeSceneNodeAdapter.js";
export class ThreeRenderBackend extends RenderBackend {
  constructor() { super("three"); }
  group(name) { return createThreeGroup(name); }
  geometry(data) { return createThreeGeometry(data); }
  material(intent) { return createThreeMaterial(intent); }
  texture(intent) { return createThreeTexture(intent); }
  skeleton(blueprint) { return createThreeSkeleton(blueprint); }
  skinnedMesh(spec) { return createThreeSkinnedMesh(spec); }
  mesh(spec = {}) { return createThreeMesh(spec.geometry, spec.material, spec.name); }
  clip(intent) { return createThreeClip(intent); }
  mixer(root) { return createThreeMixer(root); }
  mark(object, data) { return markThree(object, data); }
  dispose(object) { if (!object) return; if (object.geometry && object.geometry.dispose) object.geometry.dispose(); const mats = Array.isArray(object.material) ? object.material : [object.material]; mats.filter(Boolean).forEach(m => m.dispose && m.dispose()); }
}
export function createThreeRenderBackend() { return new ThreeRenderBackend(); }
export default createThreeRenderBackend;
