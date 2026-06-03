// B"H
/**
 * @module ProceduralTerrain
 * @description
 * Chapter 184: Terrain pulls the muted desert and visible grass scribe.
 * The Awtsmoos renews the cache seal so white-hot lava terrain cannot return.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainGeometryEmanator from "./core/TerrainGeometryEmanator.js";
import TerrainMaterialScribe from "./core/TerrainMaterialScribe.js?v=muted-desert-visible-grass-20260602-bh184";

export default class ProceduralTerrain extends Domem {
  type = "proceduralTerrain";

  constructor(op = {}, olam) {
    super(op, olam);
    this.terrainData = {
      width: op.width || 1500,
      depth: op.depth || 1500,
      thickness: op.thickness || 4,
      segments: op.segments || 32,
      hills: op.hills || [],
      textureType: op.textureType || "safegrass"
    };
  }

  async heescheel(olam) {
    this.olam = olam;
    const geometry = TerrainGeometryEmanator.emanate(this.terrainData);
    const material = await TerrainMaterialScribe.scribe(this.terrainData, this.olam, this);
    this.mesh = this.createMesh(geometry, material);
    this.mesh.name = this.name || "Sacred_Earth";
    this.mesh.nivraAwtsmoos = this;
    this.mesh.frustumCulled = true;
    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
    this.mesh.updateMatrix();
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.isSolid = true;
    this.mesh.userData.isTerrain = true;
    await olam.hoyseef(this);
    this.olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }

  heesHawvoos() {}
}
