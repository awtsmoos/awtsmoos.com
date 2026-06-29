// B"H
import { TAU } from '../math.js';

/** B"H: Dense city blocks form streets, plazas, alleys, and dangerous lanes. */
export function placeObject(center, index, budget, rand) {
  const row = Math.floor(index / 7);
  const col = index % 7;
  const avenue = col - 3;
  const depth = row - Math.floor(budget / 14);
  const grid = 76 + rand() * 18;
  const swirl = (row % 3) * 0.21 + rand() * 0.12;
  const plaza = index % 11 === 0 ? 1.7 : 1;
  const x = center.x + avenue * grid * plaza + Math.sin(depth + swirl) * 32;
  const y = center.y + depth * grid * 0.92 + Math.cos(avenue - swirl) * 38;
  if (index % 17) return { x, y };
  const angle = rand() * TAU;
  return { x: center.x + Math.cos(angle) * 430, y: center.y + Math.sin(angle) * 430 };
}
