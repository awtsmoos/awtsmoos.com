// B"H
/**
 * @file signagePass.js
 * @description Chapter 321: Entry signage assembles from manifest, posts, and
 * boards.
 */
import { ENTRY_SIGNS } from './signageConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addSignBoard } from './signBoard.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addSignPost } from './signPost.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addSigns(n) {
  ENTRY_SIGNS.forEach(sign => { addSignPost(n, sign); addSignBoard(n, sign); });
}
