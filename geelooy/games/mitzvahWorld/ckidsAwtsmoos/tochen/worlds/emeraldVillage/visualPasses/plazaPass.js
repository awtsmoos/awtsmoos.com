// B"H
/**
 * @file plazaPass.js
 * @description Chapter 297: The plaza is assembled from base, cobble rings,
 * and flower softness.
 */
import { PLAZA } from './plazaConfig.js';
import { addPlazaBase } from './plazaBase.js';
import { addPlazaCobbleRings } from './plazaCobbleRings.js';
import { addPlazaFlowers } from './plazaFlowers.js';
export function addPlaza(n) {
  addPlazaBase(n, PLAZA);
  addPlazaCobbleRings(n, PLAZA);
  addPlazaFlowers(n, PLAZA);
}
