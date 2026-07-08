// B"H
/**
 * @module ProceduralTerrain
 * @description Visual terrain mesh is the ray-ground authority; it is never frustum-culled away on mobile.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { markVisualGroundAuthority } from "./core/GroundMeshAuthority.js?compact=true&v=visible-ground-authority-20260701-bh1";
import TerrainGeometryEmanator from "./core/TerrainGeometryEmanator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import TerrainMaterialScribe from "./core/TerrainMaterialScribe.js?compact=true&v=real-repeating-grass-basic-never-vanish-20260708-bh8";
import { colliderData, hiddenGroundMaterial, insertOctree, makeSlab, n, solidFlags, syncTransform, terrainData, triangleCount } from "./core/ProceduralTerrainHelpers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ProceduralTerrain extends Domem {
  type = "proceduralTerrain";
  constructor(op = {}, olam) {
    super(op, olam);
    this.isSolid = op.isSolid !== false;
    this.noSafetySlab = Boolean(op.noSafetySlab || op.villageNoSafetySlab || op.textureType === "safegrass");
    this.terrainData = terrainData(op, this.isSolid, this.noSafetySlab);
  }
  publishTerrainLaw() {
    if (!this.olam) return;
    const p = this.mesh?.position || { x:0, y:0, z:0 };
    this.olam.awtsmoosTerrainLaw = { data:{ ...this.terrainData }, position:{ x:n(p.x), y:n(p.y), z:n(p.z) }, source:this.name || "proceduralTerrain" };
  }
  async heescheel(olam) {
    this.olam = olam;
    const geometry = TerrainGeometryEmanator.emanate(this.terrainData);
    const material = await TerrainMaterialScribe.scribe(this.terrainData, this.olam, this);
    this.mesh = this.createMesh(geometry, material);
    this.mesh.name = this.name || "Sacred_Earth_Visual";
    this.mesh.nivraAwtsmoos = this;
    this.mesh.frustumCulled = false;
    if (this.position) this.mesh.position.set(n(this.position.x), n(this.position.y), n(this.position.z));
    this.mesh.updateMatrixWorld(true);
    markVisualGroundAuthority(this.mesh, this, olam);
    Object.assign(this.mesh.userData ||= {}, { neverCullTerrain:true, neverHideTerrain:true, repeatingGrassTexture:true });
    this.publishTerrainLaw();
    await olam.hoyseef(this);
    if (this.isSolid) this.installCollisionMeshes();
    else if (globalThis.__AWTSMOOS_TERRAIN_LOGS__ === true) console.info("B\"H | TERRAIN_VISUAL_ONLY_NO_COLLIDER", { name:this.mesh.name });
    this.isReady = true;
  }
  createMesh(geometry, material) { return new THREE.Mesh(geometry, material); }
  installCollisionMeshes() {
    this.createAndInsertCollider();
    if (!this.noSafetySlab) this.createAndInsertSafetySlab();
    else if (globalThis.__AWTSMOOS_TERRAIN_LOGS__ === true) console.info("B\"H | TERRAIN_SAFETY_SLAB_SKIPPED", { name:this.mesh.name, textureType:this.terrainData.textureType });
  }
  createAndInsertCollider() {
    const geometry = TerrainGeometryEmanator.emanate(colliderData(this.terrainData));
    this.colliderMesh = new THREE.Mesh(geometry, hiddenGroundMaterial.clone());
    this.colliderMesh.name = `${this.mesh?.name || "terrain"}_lawful_octree_collider`;
    this.colliderMesh.nivraAwtsmoos = this;
    this.colliderMesh.frustumCulled = false;
    syncTransform(this.colliderMesh, this.mesh);
    solidFlags(this.colliderMesh, "terrain-detail", this.terrainData);
    Object.assign(this.colliderMesh.userData, { visualReference:this.mesh, triangleCount:triangleCount(geometry), neverCullTerrain:true });
    const added = insertOctree(this.olam, this.colliderMesh);
    if (globalThis.__AWTSMOOS_TERRAIN_LOGS__ === true) console.info("B\"H | TERRAIN_COLLIDER_INSERT", { added, triangles:triangleCount(geometry), name:this.colliderMesh.name });
  }
  createAndInsertSafetySlab() {
    this.safetySlab = makeSlab(this.mesh, this.terrainData);
    this.safetySlab.nivraAwtsmoos = this;
    this.safetySlab.frustumCulled = false;
    solidFlags(this.safetySlab, "abyss-safety-slab", this.terrainData);
    this.safetySlab.updateMatrixWorld(true);
    const added = insertOctree(this.olam, this.safetySlab);
    if (globalThis.__AWTSMOOS_TERRAIN_LOGS__ === true) console.info("B\"H | TERRAIN_SAFETY_SLAB_INSERT", { added, name:this.safetySlab.name });
  }
  heesHawvoos() {}
}
