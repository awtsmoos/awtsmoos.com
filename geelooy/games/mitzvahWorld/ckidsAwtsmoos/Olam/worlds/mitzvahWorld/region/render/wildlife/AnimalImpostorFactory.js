// B"H
/**
 * @file AnimalImpostorFactory.js
 * @description
 * Mid and far wildlife LODs keep the species silhouette but collapse the whole
 * animal into one vertex-colored mesh. That preserves selectable animals and
 * readable ecology while avoiding one draw call per ear, leg, wing, or mark.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { silhouetteFor } from "./AnimalSpeciesSilhouettes.js?compact=true&v=animal-realism-split-20260705-bh1";

const MATERIAL_CACHE = new Map();

function materialFor(tier) {
  const key = `animal-lod-merged:${tier}`;
  if (!MATERIAL_CACHE.has(key)) {
    MATERIAL_CACHE.set(key, new THREE.MeshLambertMaterial({
      vertexColors:true,
      flatShading:false
    }));
  }
  return MATERIAL_CACHE.get(key);
}

function colorTriplet(value) {
  const c = new THREE.Color(value || 0xffffff);
  return [c.r, c.g, c.b];
}

function pushVertex(out, x, y, z, color) {
  out.positions.push(x, y, z);
  out.colors.push(...color);
  return out.positions.length / 3 - 1;
}

function addBox(out, center, scale, colorValue) {
  const color = colorTriplet(colorValue);
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = scale.map(v => Math.max(0.001, Number(v) || 0.001));
  const x = sx * 0.5;
  const y = sy * 0.5;
  const z = sz * 0.5;
  const base = out.positions.length / 3;
  [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]
  ].forEach(([vx, vy, vz]) => pushVertex(out, cx + vx, cy + vy, cz + vz, color));
  out.indices.push(
    base, base + 1, base + 2, base, base + 2, base + 3,
    base + 4, base + 6, base + 5, base + 4, base + 7, base + 6,
    base, base + 4, base + 5, base, base + 5, base + 1,
    base + 1, base + 5, base + 6, base + 1, base + 6, base + 2,
    base + 2, base + 6, base + 7, base + 2, base + 7, base + 3,
    base + 3, base + 7, base + 4, base + 3, base + 4, base
  );
}

function addEllipsoid(out, center, scale, colorValue, latitude = 5, longitude = 8) {
  const color = colorTriplet(colorValue);
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = scale.map(v => Math.max(0.001, Number(v) || 0.001));
  const start = out.positions.length / 3;
  for (let y = 0; y <= latitude; y++) {
    const v = y / latitude;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x <= longitude; x++) {
      const u = x / longitude;
      const theta = u * Math.PI * 2;
      pushVertex(
        out,
        cx + Math.cos(theta) * sinPhi * sx,
        cy + cosPhi * sy,
        cz + Math.sin(theta) * sinPhi * sz,
        color
      );
    }
  }
  const row = longitude + 1;
  for (let y = 0; y < latitude; y++) {
    for (let x = 0; x < longitude; x++) {
      const a = start + y * row + x;
      const b = a + row;
      out.indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
}

function addCone(out, center, radius, height, colorValue, sides = 8) {
  const color = colorTriplet(colorValue);
  const [cx, cy, cz] = center;
  const baseCenter = pushVertex(out, cx, cy, cz, color);
  const tip = pushVertex(out, cx, cy + height, cz, color);
  const ring = [];
  for (let i = 0; i < sides; i++) {
    const a = i / sides * Math.PI * 2;
    ring.push(pushVertex(out, cx + Math.cos(a) * radius, cy, cz + Math.sin(a) * radius, color));
  }
  for (let i = 0; i < sides; i++) {
    const next = ring[(i + 1) % sides];
    out.indices.push(baseCenter, next, ring[i], ring[i], next, tip);
  }
}

function addLegs(out, s, tier) {
  const leg = s.legs;
  if (!leg || tier === "far") return;
  const zRows = (leg.count || 4) === 2 ? [leg.stanceZ || 0.08] : [leg.stanceZ || 0.24, -(leg.stanceZ || 0.24)];
  for (const side of [-1, 1]) {
    for (const z of zRows) {
      const hind = z < 0 && leg.hindScale;
      const scale = [
        leg.scale[0],
        leg.scale[1] * (hind ? leg.hindScale : 1),
        leg.scale[2]
      ];
      addBox(out, [side * (leg.stanceX || 0.2), scale[1] * 0.52, z], scale, s.dark || s.color);
    }
  }
}

function addHeadDetails(out, s, tier) {
  const y = s.low ? 0.22 : 0.54;
  const z = 0.34;
  if (s.snout) addBox(out, [0, y - 0.02, z + 0.15], s.snout, s.accent || s.color);
  if (s.ears && tier !== "far") {
    const e = s.ears.scale || [0.05, 0.2, 0.035];
    addBox(out, [-0.09, y + 0.22, z], e, s.color);
    addBox(out, [0.09, y + 0.22, z], e, s.color);
  }
  if (s.horns && tier !== "far") {
    const h = s.horns.scale || [0.04, 0.2, 0.035];
    addCone(out, [-0.11, y + 0.22, z], h[0], h[1], 0xeee0b7);
    addCone(out, [0.11, y + 0.22, z], h[0], h[1], 0xeee0b7);
    if (s.horns.kind === "antlers") addBox(out, [0, y + 0.36, z - 0.03], [0.28, 0.035, 0.035], 0xeee0b7);
  }
  if (s.eyes && tier !== "far") {
    addEllipsoid(out, [-0.08, y + 0.06, z + 0.1], s.eyes.scale, s.dark || 0x050505, 3, 6);
    addEllipsoid(out, [0.08, y + 0.06, z + 0.1], s.eyes.scale, s.dark || 0x050505, 3, 6);
  }
}

function addTailWingsAndMarks(out, s, tier) {
  if (s.tail) {
    addBox(out, [0, (s.low ? 0.17 : 0.34) + (s.tail.lift || 0), -0.44], s.tail.scale, s.tail.kind === "flag" ? (s.accent || s.color) : s.color);
  }
  if (s.wings) {
    const wingScale = tier === "far" ? [0.5, 0.04, 0.13] : s.wings.scale;
    addBox(out, [-0.28, 0.4, 0], wingScale, s.color);
    addBox(out, [0.28, 0.4, 0], wingScale, s.color);
  }
  if (tier === "far") return;
  if (s.marks?.includes("whiteChest") || s.marks?.includes("softBelly") || s.marks?.includes("whiteBelly")) {
    addEllipsoid(out, [0, 0.38, 0.18], [s.chest?.[0] || 0.18, 0.035, s.chest?.[2] || 0.12], s.accent || 0xf0e2c6, 3, 6);
  }
  if (s.marks?.includes("hidePatches") || s.marks?.includes("frogSpots") || s.marks?.includes("spots")) {
    addEllipsoid(out, [-0.12, s.low ? 0.23 : 0.48, 0.02], [0.08, 0.025, 0.08], s.dark || 0x222222, 3, 6);
    addEllipsoid(out, [0.14, s.low ? 0.24 : 0.5, -0.14], [0.07, 0.022, 0.07], s.accent || s.dark || 0xffffff, 3, 6);
  }
  if (s.marks?.includes("beak")) addCone(out, [0, 0.45, 0.43], 0.04, 0.14, 0xe1a32f, 8);
}

function createMergedAnimalLod(species = "rabbit", tier = "mid") {
  const s = silhouetteFor(species);
  const out = { positions:[], colors:[], indices:[] };
  const bodyLat = tier === "far" ? 4 : 5;
  const bodyLon = tier === "far" ? 7 : 9;
  addEllipsoid(out, [0, s.low ? 0.18 : 0.36, 0], s.body, s.color, bodyLat, bodyLon);
  if (tier !== "far" && s.chest) addEllipsoid(out, [0, s.low ? 0.22 : 0.42, 0.2], s.chest, s.color, 4, 7);
  if (tier !== "far" && s.neck) addEllipsoid(out, [0, 0.58, 0.24], s.neck, s.color, 4, 7);
  addEllipsoid(out, [0, s.low ? 0.24 : 0.52, 0.36], s.head || [0.18, 0.16, 0.16], s.color, bodyLat, bodyLon);
  addLegs(out, s, tier);
  addHeadDetails(out, s, tier);
  addTailWingsAndMarks(out, s, tier);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(out.positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(out.colors, 3));
  geometry.setIndex(out.indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(geometry, materialFor(tier));
  mesh.name = `${species}_${tier === "far" ? "far_impostor" : "mid_simple"}_wildlife_lod`;
  mesh.castShadow = false;
  mesh.receiveShadow = tier !== "far";
  Object.assign(mesh.userData ||= {}, {
    animalLodVisual:true,
    wildlifeActor:true,
    skipRaycast:true,
    skipOctree:true,
    noOctree:true,
    animalVisualTier:tier,
    anatomyScore:s.anatomyScore || 9,
    singleMergedAnimalLodMesh:true,
    drawCallsPerAnimalLod:1
  });
  return mesh;
}

export function createAnimalMidSimple(species = "rabbit") {
  return createMergedAnimalLod(species, "mid");
}

export function createAnimalFarImpostor(species = "rabbit") {
  return createMergedAnimalLod(species, "far");
}

export default { createAnimalMidSimple, createAnimalFarImpostor };
