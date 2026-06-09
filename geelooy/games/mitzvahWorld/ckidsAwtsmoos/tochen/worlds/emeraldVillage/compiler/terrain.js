// B"H
/** @file terrain.js @description Chapter 360: Ground, grass masks, and ocean are compiled together. */
export function addTerrain(n, properties, profile) {
  const grassPatches = properties.slice(0, 36).map(prop => ({ x: prop.center.x, z: prop.center.z, radius: Math.max(prop.lot?.width || 40, prop.lot?.depth || 40) * 0.75, gain: 1 }));
  n.ProceduralTerrain.emeraldGround = { name: 'Emerald Fields', width: profile.terrainSize, depth: profile.terrainSize, segments: profile.terrainSegments, material: 'dirtGrass', dirtColor: 0x4f3824, grassColor: 0x2f6f32, grassPatches, position: { x: 0, y: -0.1, z: 0 } };
  n.Ocean.world_ocean = { name: 'The Great Sea', size: profile.terrainSize, y: -1.5, color: 0x133b52 };
}
