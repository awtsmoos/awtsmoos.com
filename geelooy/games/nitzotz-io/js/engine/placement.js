// B"H
import { TAU } from '../math.js';

/** B"H: Objects enter by rings, leaving roads for the eye and player. */
export function placeObject(center, index, budget, rand) {
  const lane = index % 8;
  const ring = Math.floor(index / 8);
  const angle = lane / 8 * TAU + ring * 0.37 + rand() * 0.18;
  const radius = 74 + ring * 64 + rand() * 28 + (index % 3) * 10;
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
}
