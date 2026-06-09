// B"H
/**
 * @file plazaLampRing.js
 * @description Chapter 346: A ring of lamps gives the plaza evening rhythm.
 */
import { ringPoints } from './shapeKit.js';
import { addLampGeometry } from './lampGeometry.js';
export function addPlazaLampRing(n, ring) {
  ringPoints(ring.count, ring.radius, ring.x, ring.z).forEach((pt, i) => addLampGeometry(n, { id: `plaza_ring_lamp_${i}`, x: pt.x, z: pt.z, height: ring.height }));
}
