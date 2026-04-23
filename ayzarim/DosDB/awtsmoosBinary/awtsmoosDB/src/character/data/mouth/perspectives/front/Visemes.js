
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

/**
 * @constant FRONT_VISEMES
 * @description
 * THE LETTERS OF SPEECH (Otiyot) - FRONT PERSPECTIVE.
 * Pure phonetic Bezier shapes that the Awtsmoos uses to articulate physical reality.
 * These govern the intense auto-talking lip synchronization.
 */
export const FRONT_VISEMES = {
  // Ah: Wide open, massive vertical stretch
  A: new Path([
    { type: 'move', x: -25, y: -10 },
    { type: 'bezier', x: 0, y: 35, c1x: -25, c1y: 35, c2x: -10, c2y: 35 },
    { type: 'bezier', x: 25, y: -10, c1x: 10, c1y: 35, c2x: 25, c2y: 35 },
    { type: 'bezier', x: 0, y: -20, c1x: 25, c1y: -20, c2x: 10, c2y: -20 },
    { type: 'bezier', x: -25, y: -10, c1x: -10, c1y: -20, c2x: -25, c2y: -20 }
  ]),
  // Oh: Tight, circular protrusion
  O: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 0, y: 25, c1x: -15, c1y: 25, c2x: -10, c2y: 25 },
    { type: 'bezier', x: 15, y: -5, c1x: 10, c1y: 25, c2x: 15, c2y: 25 },
    { type: 'bezier', x: 0, y: -30, c1x: 15, c1y: -30, c2x: 10, c2y: -30 },
    { type: 'bezier', x: -15, y: -5, c1x: -10, c1y: -30, c2x: -15, c2y: -30 }
  ]),
  // Eee: Wide horizontal stretch, teeth bared
  E: new Path([
    { type: 'move', x: -40, y: 0 },
    { type: 'bezier', x: 0, y: 15, c1x: -35, c1y: 15, c2x: -10, c2y: 15 },
    { type: 'bezier', x: 40, y: 0, c1x: 10, c1y: 15, c2x: 35, c2y: 15 },
    { type: 'bezier', x: 0, y: -10, c1x: 35, c1y: -10, c2x: 10, c2y: -10 },
    { type: 'bezier', x: -40, y: 0, c1x: -10, c1y: -10, c2x: -35, c2y: -10 }
  ]),
  // Mmm: Lips sealed, compressed
  M: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: 5, c1x: -20, c1y: 5, c2x: -10, c2y: 5 },
    { type: 'bezier', x: 25, y: 0, c1x: 10, c1y: 5, c2x: 20, c2y: 5 },
    { type: 'bezier', x: 0, y: -5, c1x: 20, c1y: -5, c2x: 10, c2y: -5 },
    { type: 'bezier', x: -25, y: 0, c1x: -10, c1y: -5, c2x: -20, c2y: -5 }
  ]),
  // Lll: Tongue raised (handled by tongue engine), lips neutral open
  L: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 0, y: 20, c1x: -20, c1y: 20, c2x: -10, c2y: 20 },
    { type: 'bezier', x: 20, y: 0, c1x: 10, c1y: 20, c2x: 20, c2y: 20 },
    { type: 'bezier', x: 0, y: -15, c1x: 20, c1y: -15, c2x: 10, c2y: -15 },
    { type: 'bezier', x: -20, y: 0, c1x: -10, c1y: -15, c2x: -20, c2y: -15 }
  ])
};
