// B"H
/**
 * @file entryTreePass.js
 * @description Chapter 279: Etz Chayim is assembled from roots, lanterns, and
 * plaques, each one a separate vessel around the same living center.
 */
import { tree } from './shapeKit.js';
import { ETZ_CHAYIM } from './etzChayimConfig.js';
import { addEtzChayimLanterns } from './etzChayimLanterns.js';
import { addEtzChayimPlaque } from './etzChayimPlaque.js';
import { addEtzChayimRoots } from './etzChayimRoots.js';
export function addEntryTree(n) {
  tree(n, ETZ_CHAYIM.id, ETZ_CHAYIM.center.x, ETZ_CHAYIM.center.z, ETZ_CHAYIM.scale, ETZ_CHAYIM.preset);
  addEtzChayimRoots(n, ETZ_CHAYIM);
  addEtzChayimLanterns(n, ETZ_CHAYIM);
  addEtzChayimPlaque(n, ETZ_CHAYIM);
}
