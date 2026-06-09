// B"H
/**
 * @file guideMarkerPrompt.js
 * @description Chapter 259: The visual prompt speaks before the NPC speaks:
 * press E, talk, choose the levels, enter the first lava gate.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addGuidePrompt(n, config) {
  const c = config.center;
  box(n, config.arrow.id, config.arrow.name, p(c.x, 0.42, c.z + 2.4), config.arrow.size, '#5434ff', false);
  box(n, config.board.id, config.board.name, p(c.x, 1.65, c.z + 3.4), config.board.size, P.wood, false);
  box(n, 'central_level_guide_bubble', 'Speech bubble: Choose Levels', p(c.x + 1.7, 2.95, c.z - 0.2), [1.6, 0.8, 0.12], '#fff8d9', false);
}
