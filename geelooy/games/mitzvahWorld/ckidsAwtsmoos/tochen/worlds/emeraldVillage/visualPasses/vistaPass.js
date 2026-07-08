// B"H
/**
 * @file vistaPass.js
 * @description Chapter 488: Vista layers scale by density, retaining the
 * skyline while shrinking distant silhouettes for weaker devices.
 */
import { VISTA } from './vistaConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addVistaClouds } from './vistaClouds.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addVistaDistantHomes } from './vistaDistantHomes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addVistaMountains } from './vistaMountains.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addVistaWaterfalls } from './vistaWaterfalls.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addVista(n, density = {}) {
  const config = { ...VISTA, scale: density.vistaScale ?? 1 };
  addVistaMountains(n, config); addVistaWaterfalls(n, config); addVistaClouds(n, config); addVistaDistantHomes(n, config);
}
