// B"H
/**
 * @file vistaPass.js
 * @description Chapter 488: Vista layers scale by density, retaining the
 * skyline while shrinking distant silhouettes for weaker devices.
 */
import { VISTA } from './vistaConfig.js';
import { addVistaClouds } from './vistaClouds.js';
import { addVistaDistantHomes } from './vistaDistantHomes.js';
import { addVistaMountains } from './vistaMountains.js';
import { addVistaWaterfalls } from './vistaWaterfalls.js';
export function addVista(n, density = {}) {
  const config = { ...VISTA, scale: density.vistaScale ?? 1 };
  addVistaMountains(n, config); addVistaWaterfalls(n, config); addVistaClouds(n, config); addVistaDistantHomes(n, config);
}
