// B"H
import { RULES } from './meshRules.js';

/** B"H: Each kind receives a shape, but never a license to blind the camera. */
export function describeMesh(name) {
  return RULES[name] || ['cube', 1, 1];
}

export function shapeFor(name) {
  return describeMesh(name)[0];
}

export function scaledSize(name, radius, height) {
  const rule = describeMesh(name);
  return { sx: radius * rule[1], sz: radius * rule[1], h: height * rule[2] };
}
