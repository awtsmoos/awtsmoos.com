// B"H
/**
 * @file hazards.js
 * @description Chapter 579: Lava is visible, deadly, and lower than every safe
 * platform. The Awtsmoos does not hide a floor inside fire.
 */
import { r, v3 } from './vector.js';
export function terrain(level, b) {
  return [{ name: `level_${level}_basalt_lava_basin`, position: v3((b.minX + b.maxX) / 2, -0.92, (b.minZ + b.maxZ) / 2), width: r(Math.max(70, b.maxX - b.minX + 24)), depth: r(Math.max(36, b.maxZ - b.minZ + 22)), segments: 24, collisionSegments: 1, textureSize: 512, textureType: 'lavaBasin', material: 'lavaBasin', isSolid: false, microNoise: 0.015 }];
}
export function lava(level, b) {
  return [{ name: `level_${level}_visible_lava_hazard`, position: v3((b.minX + b.maxX) / 2, -0.34, (b.minZ + b.maxZ) / 2), width: r(Math.max(72, b.maxX - b.minX + 26)), depth: r(Math.max(38, b.maxZ - b.minZ + 24)), height: 0.28, groundY: -0.48, lava: true, pad: 0.03, opacity: 0.98, isSolid: false }];
}
export function fallReset(level, b, start) {
  return [{ name: `level_${level}_deep_fall_reset`, position: v3((b.minX + b.maxX) / 2, -7.6, (b.minZ + b.maxZ) / 2), width: r(Math.max(88, b.maxX - b.minX + 36)), height: 1, depth: r(Math.max(52, b.maxZ - b.minZ + 30)), targetPosition: v3(start.position.x, start.position.y + 1.02, start.position.z), opacity: 0, isSolid: false }];
}
