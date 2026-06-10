// B"H
/**
 * @file platforms.js
 * @description Chapter 577: Builders keep JSON valid while each level keeps its
 * own manually chosen path, rhythm, and names.
 */
import { r, v3 } from './vector.js';
export function block(name, x, y, z, width, depth, color = 0xb9894c) {
  return { name, position: v3(x, y, z), width: r(width), height: 1, depth: r(depth), color, textureSeed: name, isSolid: true, safeRect: { x: r(x), z: r(z), width: r(width), depth: r(depth) } };
}
export function moving(name, x, y, z, width, depth, axis, distance, speed, phase = 0) {
  return { name, position: v3(x, y, z), width: r(width), height: 1, depth: r(depth), color: 0x5ec8ff, textureSeed: name, isSolid: true, moving: true, axis, distance: r(distance), speed: r(speed), phase: r(phase), size: { x: r(width), y: 1, z: r(depth) }, dimensions: { x: r(width), y: 1, z: r(depth) }, safeRect: { x: r(x), z: r(z), width: r(width), depth: r(depth) } };
}
export function crumb(name, x, y, z) { return block(name, x, y, z, 2.4, 2.2, 0xc48c52); }
export function island(name, x, y, z, wide = 8.5, deep = 6.5) { return block(name, x, y, z, wide, deep, 0xd0a464); }
