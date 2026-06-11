// B"H
/**
 * @file platforms.js
 * @description
 * Chapter 640: Platform builders now speak visual language.
 *
 * The Awtsmoos does not throw anonymous stones into lava. Every block carries a
 * role, a color covenant, a texture seed, and a hint. The player sees green and
 * knows beginning; blue and knows motion; gold and knows reward; cyan and knows
 * the gate is near.
 */
import { r, v3 } from './vector.js';
import { LAVA_THEME, markPlatform } from './theme.js';

/** @param {string} name Platform name. @param {string} fallback Default role. @returns {string} Role. */
function roleFromName(name, fallback) {
  if (/start/i.test(name)) return 'start';
  if (/finish|victory|goal/i.test(name)) return 'finish';
  if (/chip|crumb|spark/i.test(name)) return 'crumb';
  if (/box|reward|tzedakah/i.test(name)) return 'reward';
  return fallback;
}

/** @param {object} platform Platform data. @param {string} role Role. @returns {object} Marked platform. */
function withRole(platform, role) {
  return markPlatform(platform, roleFromName(platform.name || '', role));
}

export function block(name, x, y, z, width, depth, color = LAVA_THEME.palette.path) {
  return withRole({ name, position: v3(x, y, z), width: r(width), height: 1, depth: r(depth), color, textureSeed: name, isSolid: true, safeRect: { x: r(x), z: r(z), width: r(width), depth: r(depth) } }, 'path');
}

export function moving(name, x, y, z, width, depth, axis, distance, speed, phase = 0) {
  return withRole({ name, position: v3(x, y, z), width: r(width), height: 1, depth: r(depth), color: LAVA_THEME.palette.moving, textureSeed: name, isSolid: true, moving: true, visualStyle: 'bluePlatform', axis, distance: r(distance), speed: r(speed), phase: r(phase), size: { x: r(width), y: 1, z: r(depth) }, dimensions: { x: r(width), y: 1, z: r(depth) }, safeRect: { x: r(x), z: r(z), width: r(width), depth: r(depth) } }, 'moving');
}

export function crumb(name, x, y, z) {
  return withRole(block(name, x, y, z, 2.4, 2.2, LAVA_THEME.palette.crumb), 'crumb');
}

export function island(name, x, y, z, wide = 8.5, deep = 6.5) {
  return withRole(block(name, x, y, z, wide, deep, LAVA_THEME.palette.path), 'path');
}
