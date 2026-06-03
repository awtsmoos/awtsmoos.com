// B"H
/**
 * @module ProceduralTerrain
 * @description
 * Chapter 239: The terrain vessel now preserves every authored landscape word.
 * Points, plateaus, roads, micro-noise, and data-texture settings flow into the
 * geometry and material scribes instead of being lost at construction.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainGeometryEmanator from "./core/TerrainGeometryEmanator.js";
import TerrainMaterialScribe from "./core/TerrainMaterialScribe.js?v=data-grass-dirt-rock-20260603-bh239";

export default class ProceduralTerrain extends Domem {
  type = "proceduralTerrain";

  constructor(op = {}, olam) {
    super(op, olam);
    this.terrainData = {
      ...op,
      width: op.width || 1500,
      depth: op.depth || 1500,
      thickness: op.thickness || 4,
      segments: op.segments || 32,
      hills: op.hills || [],
      points: op.points || op.controlPoints || [],
      controlPoints: op.controlPoints || op.points || [],
      plateaus: op.plateaus || [],
      roads: op.roads || [],
      microNoise: op.microNoise || 0,
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
    this.mesh.updateMatrix(); this.mesh.updateMatrixWorld(true);
    this.mesh.userData.isSolid = true; this.mesh.userData.isTerrain = true;
    await olam.hoyseef(this);
    this.olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }

  heesHawvoos() {}
}
