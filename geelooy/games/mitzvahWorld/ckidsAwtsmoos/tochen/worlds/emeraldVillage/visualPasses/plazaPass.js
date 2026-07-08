// B"H
/**
 * @file plazaPass.js
 * @description Chapter 297: The plaza is assembled from base, cobble rings,
 * and flower softness.
 */
import { PLAZA } from './plazaConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addPlazaBase } from './plazaBase.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addPlazaCobbleRings } from './plazaCobbleRings.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addPlazaFlowers } from './plazaFlowers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addPlaza(n) {
  addPlazaBase(n, PLAZA);
  addPlazaCobbleRings(n, PLAZA);
  addPlazaFlowers(n, PLAZA);
}
