// B"H
/**
 * @module ProceduralTerrain
 * @description
 * Chapter 363: The terrain keeps collision safety but abandons the black shader.
 *
 * Visual ground now imports the safe texture material. The collider remains a
 * simple terrain mesh plus safety slab, and the terrain law remains published so
 * props, trees, NPCs, and player grounding all speak one earth language.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import Domem from "../../chayim/domem/index.js";
import TerrainGeometryEmanator from "./core/TerrainGeometryEmanator.js";
import TerrainMaterialScribe from "./core/TerrainMaterialScribe.js?v=safe-data-texture-ground-20260603-bh363";

const hiddenGroundMaterial = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function triangleCount(geometry) {
  const indexCount = geometry?.index?.count;
  const posCount = geometry?.attributes?.position?.count;
  return Math.ceil((indexCount || posCount || 0) / 3);
}
function solidFlags(mesh, role) {
  Object.assign(mesh.userData ||= {}, { isSolid: true, isTerrain: true, explicitCollision: true, terrainColliderOnly: true, colliderRole: role });
}

export default class ProceduralTerrain extends Domem {
  type = "proceduralTerrain";

  constructor(op = {}, olam) {
    super(op, olam);
    this.terrainData = {
      ...op,
      width: n(op.width, 1500),
      depth: n(op.depth, 1500),
      thickness: n(op.thickness, 4),
      segments: Math.max(1, Math.floor(n(op.segments, 64))),
      collisionSegments: Math.max(1, Math.floor(n(op.collisionSegments, 40))),
      hills: op.hills || [],
      points: op.points || op.controlPoints || [],
      controlPoints: op.controlPoints || op.points || [],
      plateaus: op.plateaus || [],
      roads: op.roads || [],
      microNoise: n(op.microNoise, 0),
      textureType: op.textureType || "safegrass"
    };
  }

  publishTerrainLaw() {
    if (!this.olam) return;
    const p = this.mesh?.position || { x: 0, y: 0, z: 0 };
    this.olam.awtsmoosTerrainLaw = { data: { ...this.terrainData }, position: { x: n(p.x), y: n(p.y), z: n(p.z) }, source: this.name || "proceduralTerrain" };
  }

  async heescheel(olam) {
    this.olam = olam;
    const geometry = TerrainGeometryEmanator.emanate(this.terrainData);
    const material = await TerrainMaterialScribe.scribe(this.terrainData, this.olam, this);
    this.mesh = this.createMesh(geometry, material);
    this.mesh.name = this.name || "Sacred_Earth_Visual";
    this.mesh.nivraAwtsmoos = this;
    Object.assign(this.mesh.userData ||= {}, { isTerrain: true, noOctree: true, skipOctree: true, awtsmoosTerrainLaw: true });
    if (this.position) this.mesh.position.set(n(this.position.x), n(this.position.y), n(this.position.z));
    this.mesh.updateMatrixWorld(true);
    this.publishTerrainLaw();
    await olam.hoyseef(this);
    this.createAndInsertCollider();
    this.createAndInsertSafetySlab();
    this.isReady = true;
  }

  createAndInsertCollider() {
    const data = { ...this.terrainData, segments: Math.min(this.terrainData.collisionSegments, 40), microNoise: 0 };
    const geometry = TerrainGeometryEmanator.emanate(data);
    this.colliderMesh = new THREE.Mesh(geometry, hiddenGroundMaterial.clone());
    this.colliderMesh.name = `${this.mesh?.name || "terrain"}_lawful_octree_collider`;
    this.colliderMesh.nivraAwtsmoos = this;
    this.colliderMesh.position.copy(this.mesh.position);
    this.colliderMesh.rotation.copy(this.mesh.rotation);
    this.colliderMesh.scale.copy(this.mesh.scale);
    solidFlags(this.colliderMesh, "terrain-detail");
    Object.assign(this.colliderMesh.userData, { visualReference: this.mesh, triangleCount: triangleCount(geometry) });
    this.colliderMesh.updateMatrixWorld(true);
    const added = this.olam?.worldOctree?.addObject(this.colliderMesh) || false;
    console.info("B\"H | TERRAIN_COLLIDER_INSERT", { added, triangles: triangleCount(geometry), name: this.colliderMesh.name });
  }

  createAndInsertSafetySlab() {
    const w = this.terrainData.width + 28, d = this.terrainData.depth + 28;
    const y = n(this.mesh?.position?.y, 0) - 0.45;
    this.safetySlab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), hiddenGroundMaterial.clone());
    this.safetySlab.name = `${this.mesh?.name || "terrain"}_abyss_safety_slab`;
    this.safetySlab.position.set(n(this.mesh?.position?.x), y, n(this.mesh?.position?.z));
    this.safetySlab.nivraAwtsmoos = this;
    solidFlags(this.safetySlab, "abyss-safety-slab");
    this.safetySlab.updateMatrixWorld(true);
    const added = this.olam?.worldOctree?.addObject(this.safetySlab) || false;
    console.info("B\"H | TERRAIN_SAFETY_SLAB_INSERT", { added, width: w, depth: d, y });
  }

  heesHawvoos() {}
}
