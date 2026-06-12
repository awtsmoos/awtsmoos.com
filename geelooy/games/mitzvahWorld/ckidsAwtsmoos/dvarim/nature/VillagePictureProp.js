// B"H
/**
 * @file VillagePictureProp.js
 * @description
 * Chapter 430: Every visual village prop drinks from the phone-safe recipe map.
 *
 * The roof looked unchanged because stale module edges were still alive. This
 * vessel now imports the recipe covenant with a live cache seal, then grounds
 * each prop by the terrain law and local lowest point.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { markDecorative } from "./villagePicture/geometryKit.js?v=leaf-basic-phone-green-20260604-bh430";
import { VILLAGE_PICTURE_RECIPES } from "./villagePicture/recipeMap.js?v=village-polish-20260612-bh810";

const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function localMinY(root) { root.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(root); return Number.isFinite(box.min.y) && !box.isEmpty() ? box.min.y : 0; }
function terrainGroundY(olam, x, z, fallback = 0) { const law = olam?.awtsmoosTerrainLaw; if (law?.data) return num(law.position?.y) + TerrainMath.calculateHeightAt(x - num(law.position?.x), z - num(law.position?.z), law.data); const ray = new THREE.Ray(new THREE.Vector3(x, 300, z), new THREE.Vector3(0, -1, 0)); const hit = olam?.worldOctree?.rayIntersect?.(ray); return Number.isFinite(hit?.position?.y) ? hit.position.y : fallback; }

export default class VillagePictureProp extends Domem {
  type = "villagePictureProp";
  heesHawveh = false;
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false, heesHawveh: false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    this.olam = olam;
    const kind = this.options.kind || "bench";
    const recipe = VILLAGE_PICTURE_RECIPES[kind] || VILLAGE_PICTURE_RECIPES.bench;
    const p = this.position || {}, r = this.rotation || {};
    const x = num(p.x), z = num(p.z), lift = num(this.options.groundLift, 0);
    const groundY = terrainGroundY(olam, x, z, num(this.options.groundY ?? this.options.worldGroundY, 0));
    this.mesh = recipe(this.options);
    this.mesh.name = this.name || `VillagePictureProp_${kind}`;
    this.mesh.rotation.set(num(r.x), num(r.y), num(r.z));
    this.mesh.scale.setScalar(num(this.options.scale, 1));
    this.mesh.updateMatrixWorld(true);
    const y = groundY + lift - localMinY(this.mesh);
    this.mesh.position.set(x, y, z);
    Object.assign(this.mesh.userData ||= {}, { useAuthoredY: true, awtsmoosGrounding: { mode: "terrain-law-local-min", groundY, lift, y, kind } });
    markDecorative(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
  heesHawvoos() {}
}
