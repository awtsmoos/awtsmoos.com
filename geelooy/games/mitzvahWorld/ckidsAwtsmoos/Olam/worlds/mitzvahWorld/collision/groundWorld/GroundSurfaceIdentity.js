// B"H
/**
 * Purpose: translate real mesh ray hits into terrain surface identity.
 * Owner: GroundCollisionWorld.
 * Inputs: raycast hit, face normal, and terrain Object3D userData/material.
 * Outputs: surfaceKey, materialKey, biomeKey, walkable flag, and slope.
 * Runtime authority: describes measured mesh hits only; no height guessing.
 * Update order: called after a real triangle hit and before player clamp.
 * Callers: GroundCollisionWorld._meshHit.
 * Invariants: fallback hits never claim mesh material authority.
 * Failure modes: missing metadata resolves to explicit unknown keys.
 */
const DEG = 180 / Math.PI;
const UP = { x:0, y:1, z:0 };
const valueOf = (...values) => values.find(v => typeof v === "string" && v.length) || null;
const matName = mat => Array.isArray(mat) ? valueOf(...mat.map(m => m?.name)) : mat?.name || null;

function terrainData(object) {
  return object?.nivraAwtsmoos?.terrainData || object?.userData?.terrainData || {};
}

export function surfaceIdentity(hit, normal) {
  const object = hit?.object || null;
  const data = object?.userData || {};
  const terrain = terrainData(object);
  const material = object?.material || null;
  const textureType = valueOf(data.textureType, terrain.textureType, terrain.material);
  const surfaceKey = valueOf(data.surfaceKey, data.terrainSurface, textureType, "terrain:unknown");
  const materialKey = valueOf(data.materialKey, data.terrainMaterial, matName(material), textureType, "material:unknown");
  const biomeKey = valueOf(data.biomeKey, terrain.biome, terrain.textureType, "biome:terrain");
  const ny = Number.isFinite(normal?.y) ? normal.y : UP.y;
  const slopeDegrees = Math.acos(Math.max(-1, Math.min(1, ny))) * DEG;
  const walkable = data.walkable !== false && slopeDegrees <= Number(data.maxWalkSlopeDegrees || 52);
  return { surfaceKey, materialKey, biomeKey, walkable, slopeDegrees, textureType:textureType || null };
}
