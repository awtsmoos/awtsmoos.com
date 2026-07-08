// B"H
/**
 * @module TerrainGeometryEmanator
 * @description
 * Chapter 233: The plane becomes a countryside from points, roads, and plateaus.
 * The Awtsmoos keeps the terrain algorithm pure and data-first so village JSON
 * can shape hills without heavy runtime ray work.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import TerrainMath from './TerrainMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class TerrainGeometryEmanator {
  static emanate(data = {}) {
    const width = Number(data.width || 1500);
    const depth = Number(data.depth || 1500);
    const segments = Math.max(1, Math.floor(Number(data.segments || 32)));
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    const needsHeight = data.hills?.length || data.points?.length || data.controlPoints?.length || data.plateaus?.length || data.roads?.length || data.microNoise;
    if (needsHeight) {
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 1) pos.setY(i, TerrainMath.calculateHeightAt(pos.getX(i), pos.getZ(i), data));
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.boundingSphere.radius = Math.max(width, depth) * 0.85;
    return geometry;
  }
}
