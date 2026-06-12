// B"H
/** @file RegionInstancer.js @description InstancedMesh creation with terrain-grounded matrices and phone-safe blade sides. */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundedMatrix } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function makeInstancedLayer({ olam, name, geometry = "box", material = "grass", count = 1, build, simple = true }) {
  const side = geometry === "blade" ? THREE.DoubleSide : THREE.FrontSide;
  const mesh = new THREE.InstancedMesh(regionGeometry(geometry), regionMaterial(material, { simple, side }), count);
  mesh.name = name; mesh.frustumCulled = true; mesh.castShadow = false; mesh.receiveShadow = true;
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const spec = build(i);
    mesh.setMatrixAt(i, groundedMatrix(olam, spec.x, spec.z, spec.sx, spec.sy, spec.sz, spec.yaw || 0, spec.lift || 0));
    if (spec.color) mesh.setColorAt?.(i, color.set(spec.color));
  }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return sealRegionVisual(mesh, { instancedRegionLayer: true, instanceCount: count });
}
