// B"H
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { animalRule } from "../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const ARCHETYPES = {
  fox:{ color:0xb85a2b, accent:0xf3d3a2, dark:0x2b1a12, scale:[1.42, .56, .44], tail:"bushy", ears:"point", paws:true, claws:true, hp:42, damage:6, markings:"socks" },
  goat:{ color:0xd8d0bd, accent:0x7a6b54, dark:0x3e3328, scale:[1.18, .68, .48], horns:"swept", beard:true, hooves:true, ears:"side", hp:48, damage:5, markings:"patches" },
  cow:{ color:0xf0eadc, accent:0x3d3028, dark:0x1a1715, scale:[1.82, .84, .66], horns:"short", hooves:true, ears:"round", hp:70, damage:4, markings:"large-patches" },
  deer:{ color:0xba7a42, accent:0xf4e6ca, dark:0x3b271b, scale:[1.34, .72, .42], antlers:true, hooves:true, ears:"large", hp:45, damage:4, markings:"spots", tail:"short" },
  rabbit:{ color:0xd8c3a7, accent:0xf4eadc, dark:0x3a2d25, scale:[.72, .48, .38], ears:"long", paws:true, hp:24, damage:2, markings:"belly", tail:"cotton" },
  frog:{ color:0x4f9a46, accent:0xc9e489, dark:0x223918, scale:[.62, .32, .48], eyes:"raised", webbed:true, hp:20, damage:2, markings:"mottled" },
  bird:{ color:0x4f6aa3, accent:0xe9d7a8, dark:0x151515, scale:[.58, .42, .34], beak:true, wings:true, feathers:true, hp:20, damage:2, tail:"fan" },
  chicken:{ color:0xf1eee2, accent:0xc73b2d, dark:0xd99a21, scale:[.72, .5, .42], beak:true, wings:true, feathers:true, comb:true, hp:22, damage:2, tail:"upright" },
  boar:{ color:0x5f4635, accent:0xded1b4, dark:0x23180f, scale:[1.45, .72, .58], tusks:true, ears:"round", bristles:true, hooves:true, hp:55, damage:7, markings:"mud" },
  sheep:{ color:0xe7e1d2, accent:0x3d352e, dark:0x2c251f, scale:[1.1, .72, .56], wool:true, hooves:true, ears:"side", hp:44, damage:3, markings:"dark-face" },
  dog:{ color:0x8b5a32, accent:0xf1e5d2, dark:0x2f2017, scale:[1.05, .58, .42], ears:"floppy", paws:true, claws:true, hp:40, damage:5, markings:"chest" },
  horse:{ color:0x8a4f2c, accent:0x17110d, dark:0x120d09, scale:[1.72, .9, .54], mane:true, hooves:true, ears:"point", hp:80, damage:5, tail:"long-hair" },
  guardian_ram:{ color:0x8f8370, accent:0xd6c188, dark:0x312a21, scale:[1.65, .82, .68], horns:"curled", elite:true, ears:"side", wool:true, hooves:true, hp:86, damage:10 }
};

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness:extra.roughness ?? .85, metalness:extra.metalness ?? .02, flatShading:Boolean(extra.flatShading) });
}

function addPart(group, name, mesh, x, y, z, scale = null, tags = []) {
  mesh.name = name;
  mesh.position.set(x, y, z);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.tags = tags;
  group.add(mesh);
  return mesh;
}

function sphere(r = .5, w = 16, h = 10) { return new THREE.SphereGeometry(r, w, h); }
function cyl(r1, r2, h, seg = 10) { return new THREE.CylinderGeometry(r1, r2, h, seg); }
function cone(r, h, seg = 12) { return new THREE.ConeGeometry(r, h, seg); }

function addEye(group, side, s, dark, x, y, z) {
  addPart(group, `eye_${side}`, new THREE.Mesh(sphere(.034 * s, 10, 8), mat(0x070707, { roughness:.25 })), x, y, z, null, ["eye"]);
  addPart(group, `eyelid_${side}_top`, new THREE.Mesh(cyl(.038 * s, .035 * s, .018 * s, 8), mat(dark)), x - .008 * s, y + .028 * s, z, [.9, .28, .42], ["eyelid"]);
}

function addLeg(group, index, x, z, s, spec, fur, accent) {
  addPart(group, `upper_leg_${index}`, new THREE.Mesh(cyl(.075 * s, .09 * s, .34 * s, 10), fur), x, .48 * s, z, null, ["leg", "shoulder"]);
  addPart(group, `lower_leg_${index}`, new THREE.Mesh(cyl(.055 * s, .07 * s, .36 * s, 10), fur), x + (index < 3 ? .035 : -.025) * s, .2 * s, z, null, ["leg", "knee", "ankle"]);
  const footGeom = spec.hooves ? cyl(.08 * s, .065 * s, .08 * s, 8) : sphere(.08 * s, 10, 6);
  const foot = addPart(group, spec.hooves ? `hoof_${index}` : `paw_${index}`, new THREE.Mesh(footGeom, accent), x + .04 * s, .04 * s, z, spec.hooves ? [1.15, .45, .75] : [1.2, .45, .8], [spec.hooves ? "hoof" : "paw", spec.claws ? "claw" : "foot"]);
  foot.rotation.z = Math.PI / 2;
  if (spec.claws) addPart(group, `claws_${index}`, new THREE.Mesh(cone(.025 * s, .12 * s, 6), accent), x + .15 * s, .04 * s, z, [.45, 1, .45], ["claw"]).rotation.z = -Math.PI / 2;
}

function addEar(group, side, zSign, s, spec, fur) {
  let geom = cone(.1 * s, .28 * s, 8);
  let scale = [1, 1, .55];
  if (spec.ears === "round") geom = sphere(.105 * s, 10, 8);
  if (spec.ears === "long") scale = [.72, 1.9, .42];
  if (spec.ears === "floppy") scale = [.85, 1.25, .42];
  if (spec.ears === "large") scale = [1.1, 1.45, .48];
  const ear = addPart(group, `ear_${side}`, new THREE.Mesh(geom, fur), .6 * s, 1.28 * s, zSign * .2 * s, scale, ["ear"]);
  ear.rotation.z = spec.ears === "floppy" ? zSign * .8 : zSign * -.22;
}

function addMarkings(group, spec, s, accent, dark) {
  if (spec.markings === "spots") {
    for (let i = 0; i < 7; i++) addPart(group, `spot_${i}`, new THREE.Mesh(sphere(.035 * s, 8, 6), accent), (-.35 + i * .13) * s, (1.02 + (i % 2) * .08) * s, (i % 3 - 1) * .22 * s, [1.5, .35, 1], ["marking"]);
  } else if (spec.markings?.includes("patch")) {
    for (let i = 0; i < 5; i++) addPart(group, `coat_patch_${i}`, new THREE.Mesh(sphere(.09 * s, 8, 6), i % 2 ? dark : accent), (-.45 + i * .24) * s, .86 * s, (i % 2 ? .31 : -.31) * s, [1.4, .45, .55], ["marking"]);
  } else if (spec.markings === "socks") {
    for (let i = 1; i <= 4; i++) addPart(group, `dark_sock_${i}`, new THREE.Mesh(cyl(.064 * s, .074 * s, .12 * s, 8), dark), [-.48, -.1, .34, .62][i - 1] * s, .11 * s, (i % 2 ? .24 : -.24) * s, null, ["marking", "sock"]);
  } else if (spec.markings === "mottled") {
    for (let i = 0; i < 9; i++) addPart(group, `mottle_${i}`, new THREE.Mesh(sphere(.025 * s, 7, 5), dark), (-.22 + i * .055) * s, (.48 + (i % 2) * .12) * s, (i % 3 - 1) * .2 * s, [1.5, .35, 1], ["marking"]);
  }
}

function addHornsOrAntlers(group, spec, s, accent) {
  if (spec.horns) {
    const curled = spec.horns === "curled";
    for (const z of [-1, 1]) {
      const horn = addPart(group, `horn_${z > 0 ? "left" : "right"}`, new THREE.Mesh(cone(.055 * s, curled ? .5 * s : .34 * s, 10), accent), .72 * s, 1.36 * s, z * .13 * s, [curled ? 1.4 : 1, 1, 1], ["horn"]);
      horn.rotation.z = z * (curled ? .9 : -.45);
      if (curled) addPart(group, `horn_curl_${z > 0 ? "left" : "right"}`, new THREE.Mesh(new THREE.TorusGeometry(.13 * s, .025 * s, 8, 18, Math.PI * 1.25), accent), .7 * s, 1.3 * s, z * .19 * s, null, ["horn"]);
    }
  }
  if (spec.antlers) {
    for (const z of [-1, 1]) {
      const main = addPart(group, `antler_${z > 0 ? "left" : "right"}`, new THREE.Mesh(cyl(.018 * s, .026 * s, .48 * s, 6), accent), .64 * s, 1.48 * s, z * .16 * s, null, ["antler"]);
      main.rotation.z = z * -.35;
      for (let i = 0; i < 2; i++) {
        const tine = addPart(group, `antler_tine_${z}_${i}`, new THREE.Mesh(cyl(.012 * s, .016 * s, .22 * s, 6), accent), (.61 - i * .06) * s, (1.55 + i * .09) * s, z * (.21 + i * .04) * s, null, ["antler"]);
        tine.rotation.z = z * -.8;
      }
    }
  }
}

export function createRealisticAnimalMesh(species = "fox") {
  const spec = ARCHETYPES[species] || ARCHETYPES.fox;
  const rules = animalRule(species);
  const group = new THREE.Group();
  group.name = `animal_${species}`;
  group.userData = { awtsType:"wowAnimal", species, kosherSpecies:Boolean(rules.kosher), animalRules:rules, selectable:true, combatTarget:true, corpseProxy:false, lod:{ near:"hyper-real-generated", mid:"recognizable-anatomy", far:"clear-silhouette" } };
  const fur = mat(spec.color);
  const accent = mat(spec.accent);
  const dark = mat(spec.dark || 0x181818);
  const [sx, sy, sz] = spec.scale;
  const bodyY = spec.webbed ? .38 : .75;
  addPart(group, "torso", new THREE.Mesh(sphere(.62, 22, 14), fur), 0, bodyY, 0, [sx, sy, sz], ["body", "torso"]);
  addPart(group, "chest", new THREE.Mesh(sphere(.34, 16, 10), accent), .35, bodyY + .07, .02, [.85, .92, .7], ["body", "chest", "shoulder"]);
  addPart(group, "hips", new THREE.Mesh(sphere(.33, 16, 10), fur), -.58, bodyY - .02, 0, [.95, .84, .75], ["body", "hips"]);
  addPart(group, "belly", new THREE.Mesh(sphere(.28, 16, 8), accent), .02, bodyY - .2, 0, [1.45, .34, 1.05], ["belly"]);
  addPart(group, "neck", new THREE.Mesh(cyl(.13, .18, .36, 12), fur), .63, bodyY + .23, 0, [1, 1, .85], ["neck"]).rotation.z = -.65;
  addPart(group, "head", new THREE.Mesh(sphere(.31, 18, 12), fur), .86, bodyY + .34, 0, [1.05, .9, .8], ["head"]);
  if (spec.beak) {
    addPart(group, "beak", new THREE.Mesh(cone(.09, .28, 12), spec.comb ? dark : accent), 1.13, bodyY + .31, 0, [1, .62, .9], ["beak"]).rotation.z = -Math.PI / 2;
  } else {
    addPart(group, "jaw", new THREE.Mesh(sphere(.12, 12, 8), accent), 1.04, bodyY + .22, 0, [1.55, .42, .72], ["jaw", "mouth"]);
    addPart(group, "snout", new THREE.Mesh(cone(.15, .36, 14), accent), 1.14, bodyY + .29, 0, [1, .78, .82], ["snout"]).rotation.z = -Math.PI / 2;
    addPart(group, "nose", new THREE.Mesh(sphere(.055, 10, 8), dark), 1.32, bodyY + .31, 0, [1, .7, .8], ["nose"]);
    addPart(group, "nostril_left", new THREE.Mesh(sphere(.012, 6, 4), mat(0x050505)), 1.36, bodyY + .32, .032, null, ["nostril"]);
    addPart(group, "nostril_right", new THREE.Mesh(sphere(.012, 6, 4), mat(0x050505)), 1.36, bodyY + .32, -.032, null, ["nostril"]);
  }
  addEye(group, "left", 1, spec.dark, .98, bodyY + .43, .16);
  addEye(group, "right", 1, spec.dark, .98, bodyY + .43, -.16);
  if (spec.ears) {
    addEar(group, "left", 1, 1, spec, fur);
    addEar(group, "right", -1, 1, spec, fur);
  }
  for (const [index, x] of [-.46, -.12, .34, .62].entries()) addLeg(group, index + 1, x, index % 2 ? -.22 : .22, 1, spec, fur, accent);
  if (spec.tail) {
    const tailLength = spec.tail === "short" || spec.tail === "cotton" ? .32 : spec.tail === "fan" || spec.tail === "upright" ? .45 : .86;
    const tail = addPart(group, "tail", new THREE.Mesh(spec.tail === "cotton" ? sphere(.16, 12, 8) : cone(.14, tailLength, 12), fur), -.86, bodyY + .08, 0, spec.tail === "bushy" ? [1.35, 1.1, 1.1] : null, ["tail"]);
    tail.rotation.z = spec.tail === "upright" ? -.65 : Math.PI / 2.65;
  }
  addHornsOrAntlers(group, spec, 1, accent);
  if (spec.tusks) {
    addPart(group, "tusk_left", new THREE.Mesh(cone(.035, .22, 8), accent), 1.18, bodyY + .14, .1, null, ["tusk"]).rotation.z = -Math.PI / 2;
    addPart(group, "tusk_right", new THREE.Mesh(cone(.035, .22, 8), accent), 1.18, bodyY + .14, -.1, null, ["tusk"]).rotation.z = -Math.PI / 2;
  }
  if (spec.wings) {
    addPart(group, "wing_left", new THREE.Mesh(sphere(.22, 12, 8), fur), .05, bodyY + .05, .39, [1.45, .28, .82], ["wing", "feathers"]);
    addPart(group, "wing_right", new THREE.Mesh(sphere(.22, 12, 8), fur), .05, bodyY + .05, -.39, [1.45, .28, .82], ["wing", "feathers"]);
  }
  if (spec.comb) addPart(group, "comb", new THREE.Mesh(cone(.06, .18, 5), accent), .83, bodyY + .68, 0, [1.1, 1.1, .28], ["comb"]);
  if (spec.beard) addPart(group, "beard", new THREE.Mesh(cone(.08, .26, 8), dark), .96, bodyY + .02, 0, [1, 1.25, .8], ["beard", "fur-tuft"]);
  if (spec.mane) addPart(group, "mane", new THREE.Mesh(cyl(.04, .06, .75, 8), dark), .34, bodyY + .5, 0, [1.4, 1, .85], ["mane", "fur-tuft"]).rotation.z = Math.PI / 2;
  if (spec.bristles) addPart(group, "bristles", new THREE.Mesh(cone(.05, .28, 6), dark), -.05, bodyY + .55, 0, [2.4, 1, .5], ["bristles", "fur-tuft"]).rotation.z = Math.PI / 2;
  if (spec.wool) {
    for (let i = 0; i < 11; i++) addPart(group, `wool_tuft_${i}`, new THREE.Mesh(sphere(.105, 8, 6), fur), (-.54 + i * .11), bodyY + .22 + (i % 2) * .06, (i % 3 - 1) * .22, [1.15, .8, 1], ["wool", "fur-tuft"]);
  }
  if (spec.feathers) {
    for (let i = 0; i < 5; i++) addPart(group, `feather_${i}`, new THREE.Mesh(cone(.035, .2, 6), fur), -.4 - i * .045, bodyY + .18, (i - 2) * .06, [1, 1, .45], ["feather"]).rotation.z = Math.PI / 2.3;
  }
  addMarkings(group, spec, 1, accent, dark);
  const mid = addPart(group, "mid_lod_silhouette", new THREE.Mesh(sphere(.42, 10, 6), fur), 0, bodyY, 0, [sx, sy, sz], ["lod-mid"]);
  mid.visible = false;
  const farGeom = typeof THREE.CapsuleGeometry === "function" ? new THREE.CapsuleGeometry(.35, .8, 3, 8) : sphere(.4, 8, 5);
  const far = addPart(group, "far_lod_silhouette", new THREE.Mesh(farGeom, fur), 0, bodyY, 0, [sx, sy, sz], ["lod-far"]);
  far.visible = false;
  const proxy = addPart(group, "selection_proxy", new THREE.Mesh(cyl(.84, .84, .035, 32), mat(0xffd966)), 0, .03, 0);
  proxy.visible = false;
  group.userData.anatomyParts = group.children.map(child => child.name);
  group.userData.hyperRealProcedural = true;
  group.userData.speciesSilhouette = { torso:true, chest:true, hips:true, neck:true, head:true, jaw:!spec.beak, snout:!spec.beak, beak:Boolean(spec.beak), eyes:true, eyelids:true, ears:Boolean(spec.ears), horns:Boolean(spec.horns), antlers:Boolean(spec.antlers), tusks:Boolean(spec.tusks), legs:4, paws:Boolean(spec.paws), hooves:Boolean(spec.hooves), claws:Boolean(spec.claws), tail:Boolean(spec.tail), furTufts:Boolean(spec.wool || spec.beard || spec.mane || spec.bristles), feathers:Boolean(spec.feathers), markings:Boolean(spec.markings) };
  return group;
}

export function createAnimalState(id, species, name, x, y) {
  const spec = ARCHETYPES[species] || ARCHETYPES.fox;
  const rules = animalRule(species);
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
    kosherSpecies:Boolean(rules.kosher),
    animalRules:rules,
    behavior:[...(rules.behavior || [])],
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
  const parts = animal.anatomicalParts || [];
  return {
    id:animal.id,
    species:animal.species,
    alive:!animal.dead,
    hp:animal.hp,
    anatomyCount:parts.length,
    hasBody:parts.includes("torso") && parts.includes("chest") && parts.includes("hips") && parts.includes("belly"),
    hasHead:parts.includes("head") && parts.includes("neck"),
    hasLegs:parts.filter(name => name.startsWith("upper_leg_")).length >= 4 && parts.filter(name => name.startsWith("lower_leg_")).length >= 4,
    hasSnout:parts.includes("snout") || parts.includes("beak"),
    hasJaw:parts.includes("jaw") || parts.includes("beak"),
    hasNoseOrBeak:parts.includes("nose") || parts.includes("beak"),
    hasNostrils:parts.includes("nostril_left") || parts.includes("beak"),
    hasEyes:parts.includes("eye_left") && parts.includes("eye_right"),
    hasEyelids:parts.includes("eyelid_left_top") && parts.includes("eyelid_right_top"),
    hasEars:parts.includes("ear_left") && parts.includes("ear_right"),
    hasTail:parts.includes("tail") || ["frog"].includes(animal.species),
    hasFeet:parts.some(name => name.startsWith("hoof_") || name.startsWith("paw_")),
    hasSpeciesDetail:parts.some(name => /horn|antler|tusk|wool|feather|wing|comb|beard|mane|bristle|spot|patch|mottle|sock/.test(name)),
    hasLod:parts.includes("mid_lod_silhouette") && parts.includes("far_lod_silhouette"),
    selectionProxy:true,
    combatProxy:true,
    corpseProxy:animal.dead === true,
    kosherSpecies:Boolean(animal.kosherSpecies),
    behaviors:animal.behavior || [],
    harvestRule:animal.animalRules?.harvest || null
  };
}
