// B"H
import * as THREE from "/games/scripts/build/three.module.js";

const ARCHETYPES = {
  fox:{ color:0xb85a2b, accent:0xf3d3a2, scale:[1.35, 0.55, 0.45], tail:true, ears:"point", hp:42, damage:6 },
  goat:{ color:0xd8d0bd, accent:0x7a6b54, scale:[1.18, 0.68, 0.48], horns:true, ears:"side", hp:48, damage:5 },
  boar:{ color:0x5f4635, accent:0xded1b4, scale:[1.45, 0.72, 0.58], tusks:true, ears:"round", hp:55, damage:7 },
  guardian_ram:{ color:0x8f8370, accent:0xd6c188, scale:[1.65, 0.82, 0.68], horns:true, elite:true, ears:"side", hp:86, damage:10 }
};

function mat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness:0.85, metalness:0.02 });
}

function addPart(group, name, mesh, x, y, z) {
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export function createRealisticAnimalMesh(species = "fox") {
  const spec = ARCHETYPES[species] || ARCHETYPES.fox;
  const group = new THREE.Group();
  group.name = `animal_${species}`;
  group.userData = { awtsType:"wowAnimal", species, selectable:true, combatTarget:true, corpseProxy:false };
  const fur = mat(spec.color);
  const accent = mat(spec.accent);
  const [sx, sy, sz] = spec.scale;
  addPart(group, "body", new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 12), fur), 0, 0.75, 0).scale.set(sx, sy, sz);
  addPart(group, "chest", new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), accent), 0.34, 0.82, 0.03).scale.set(0.8, 0.88, 0.66);
  addPart(group, "head", new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), fur), 0.82, 0.98, 0).scale.set(1, 0.86, 0.78);
  addPart(group, "snout", new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 14), accent), 1.12, 0.95, 0).rotation.z = -Math.PI / 2;
  addPart(group, "eye_left", new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0x050505)), 0.94, 1.07, 0.16);
  addPart(group, "eye_right", new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0x050505)), 0.94, 1.07, -0.16);
  const earGeom = spec.ears === "round" ? new THREE.SphereGeometry(0.11, 10, 8) : new THREE.ConeGeometry(0.11, 0.26, 8);
  addPart(group, "ear_left", new THREE.Mesh(earGeom, fur), 0.74, 1.28, 0.18);
  addPart(group, "ear_right", new THREE.Mesh(earGeom, fur), 0.74, 1.28, -0.18);
  for (const [index, x] of [-0.42, -0.08, 0.34, 0.62].entries()) {
    addPart(group, `leg_${index + 1}`, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.58, 10), fur), x, 0.32, index % 2 ? -0.2 : 0.2);
  }
  addPart(group, "tail", new THREE.Mesh(new THREE.ConeGeometry(0.14, spec.tail ? 0.86 : 0.5, 12), fur), -0.86, 0.86, 0).rotation.z = Math.PI / 2.65;
  if (spec.horns) {
    addPart(group, "horn_left", new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 10), accent), 0.78, 1.32, 0.13).rotation.z = -0.45;
    addPart(group, "horn_right", new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 10), accent), 0.78, 1.32, -0.13).rotation.z = -0.45;
  }
  if (spec.tusks) {
    addPart(group, "tusk_left", new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.2, 8), accent), 1.12, 0.82, 0.1).rotation.z = -Math.PI / 2;
    addPart(group, "tusk_right", new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.2, 8), accent), 1.12, 0.82, -0.1).rotation.z = -Math.PI / 2;
  }
  const proxy = addPart(group, "selection_proxy", new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.035, 32), mat(0xffd966)), 0, 0.03, 0);
  proxy.visible = false;
  group.userData.anatomyParts = group.children.map(child => child.name);
  return group;
}

export function createAnimalState(id, species, name, x, y) {
  const spec = ARCHETYPES[species] || ARCHETYPES.fox;
  return {
    id,
    species,
    name,
    x,
    y,
    hp:spec.hp,
    maxHp:spec.hp,
    damage:spec.damage,
    elite:Boolean(spec.elite),
    selected:false,
    dead:false,
    corpseId:null,
    retaliations:0,
    effects:0,
    mesh:null,
    anatomicalParts:[]
  };
}

export function animalProof(animal) {
  return {
    id:animal.id,
    species:animal.species,
    alive:!animal.dead,
    hp:animal.hp,
    anatomyCount:animal.anatomicalParts?.length || 0,
    hasBody:animal.anatomicalParts?.includes("body"),
    hasHead:animal.anatomicalParts?.includes("head"),
    hasLegs:(animal.anatomicalParts || []).filter(name => name.startsWith("leg_")).length >= 4,
    hasSnout:animal.anatomicalParts?.includes("snout"),
    hasEyes:animal.anatomicalParts?.includes("eye_left") && animal.anatomicalParts?.includes("eye_right"),
    hasEars:animal.anatomicalParts?.includes("ear_left") && animal.anatomicalParts?.includes("ear_right"),
    hasTail:animal.anatomicalParts?.includes("tail"),
    selectionProxy:true,
    combatProxy:true,
    corpseProxy:animal.dead === true
  };
}
