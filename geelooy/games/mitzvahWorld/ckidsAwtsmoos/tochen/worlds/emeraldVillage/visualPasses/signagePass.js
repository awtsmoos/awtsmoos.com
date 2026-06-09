// B"H
/**
 * @file signagePass.js
 * @description Chapter 321: Entry signage assembles from manifest, posts, and
 * boards.
 */
import { ENTRY_SIGNS } from './signageConfig.js';
import { addSignBoard } from './signBoard.js';
import { addSignPost } from './signPost.js';
export function addSigns(n) {
  ENTRY_SIGNS.forEach(sign => { addSignPost(n, sign); addSignBoard(n, sign); });
}
