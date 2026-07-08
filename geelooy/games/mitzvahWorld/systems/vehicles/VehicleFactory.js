// B"H
/** Shared primitive factory: the Awtsmoos lets one geometry become many journeys. */
import { VehicleEntity } from "./VehicleEntity.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

const cache = new WeakMap();

export function vehicleKit(THREE) {
  if (cache.has(THREE)) return cache.get(THREE);
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.08 });
  const kit = {
    body: new THREE.BoxGeometry(1, 1, 1),
    wheel: new THREE.CylinderGeometry(0.45, 0.45, 0.28, 24),
    axle: new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12),
    post: new THREE.CylinderGeometry(0.08, 0.08, 1, 10),
    mats: {
      wood: mat(0x8b5a2b), darkWood: mat(0x55361d), gold: mat(0xd6a739),
      iron: mat(0x30343b), canvas: mat(0xb98d55), red: mat(0x7f1d1d), blue: mat(0x1e3a8a)
    }
  };
  cache.set(THREE, kit);
  return kit;
}

export function box(THREE, parent, kit, name, scale, pos, material) {
  const mesh = new THREE.Mesh(kit.body, material);
  mesh.name = name;
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function wheel(THREE, parent, kit, pos, radius = 0.45) {
  const mesh = new THREE.Mesh(kit.wheel, kit.mats.iron);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.z = Math.PI / 2;
  mesh.scale.set(radius / 0.45, radius / 0.45, 1);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

export function finalizeVehicle(spec, mesh, wheels = [], steering = []) {
  mesh.userData ||= {};
  const vehicle = new VehicleEntity({ ...spec, mesh, wheels, steering });
  mesh.userData.vehicle = vehicle;
  mesh.userData.vehicleId = vehicle.id;
  return vehicle;
}
