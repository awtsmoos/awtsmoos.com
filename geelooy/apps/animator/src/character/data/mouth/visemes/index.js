/* B”H */
import { Path } from '../../../../utils/geom/Path.js';

export const VISEMES = {
  O: new Path([
    { type: 'move', x: -18, y: 0 },
    { type: 'bezier', x: 0, y: 45, c1x: -18, c1y: 45, c2x: -10, c2y: 45 },
    { type: 'bezier', x: 18, y: 0, c1x: 10, c1y: 45, c2x: 18, c2y: 45 },
    { type: 'bezier', x: 0, y: -45, c1x: 18, c1y: -45, c2x: 10, c2y: -45 },
    { type: 'bezier', x: -18, y: 0, c1x: -10, c1y: -45, c2x: -18, c2y: -45 }
  ]),
  S: new Path([
    { type: 'move', x: -28, y: 0 },
    { type: 'bezier', x: 0, y: 4, c1x: -28, c1y: 4, c2x: -10, c2y: 4 },
    { type: 'bezier', x: 28, y: 0, c1x: 10, c1y: 4, c2x: 28, c2y: 4 },
    { type: 'bezier', x: 0, y: -4, c1x: 28, c1y: -4, c2x: 10, c2y: -4 },
    { type: 'bezier', x: -28, y: 0, c1x: -10, c1y: -4, c2x: -28, c2y: -4 }
  ]),
  M: new Path([
    { type: 'move', x: -22, y: 0 },
    { type: 'bezier', x: 0, y: 2, c1x: -22, c1y: 2, c2x: -10, c2y: 2 },
    { type: 'bezier', x: 22, y: 0, c1x: 10, c1y: 2, c2x: 22, c2y: 2 },
    { type: 'bezier', x: 0, y: -2, c1x: 22, c1y: -2, c2x: 10, c2y: -2 },
    { type: 'bezier', x: -22, y: 0, c1x: -10, c1y: -2, c2x: -22, c2y: -2 }
  ]),
  F: new Path([
    { type: 'move', x: -22, y: 0 },
    { type: 'bezier', x: 0, y: 18, c1x: -22, c1y: 18, c2x: -10, c2y: 18 },
    { type: 'bezier', x: 22, y: 0, c1x: 10, c1y: 18, c2x: 22, c2y: 18 },
    { type: 'bezier', x: 0, y: -5, c1x: 22, c1y: -5, c2x: 10, c2y: -5 },
    { type: 'bezier', x: -22, y: 0, c1x: -10, c1y: -5, c2x: -22, c2y: -5 }
  ]),
  L: new Path([
    { type: 'move', x: -22, y: 0 },
    { type: 'bezier', x: 0, y: 28, c1x: -22, c1y: 28, c2x: -10, c2y: 28 },
    { type: 'bezier', x: 22, y: 0, c1x: 10, c1y: 28, c2x: 22, c2y: 28 },
    { type: 'bezier', x: 0, y: -15, c1x: 22, c1y: -15, c2x: 10, c2y: -15 },
    { type: 'bezier', x: -22, y: 0, c1x: -10, c1y: -15, c2x: -22, c2y: -15 }
  ]),
  A: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: 35, c1x: -25, c1y: 35, c2x: -10, c2y: 35 },
    { type: 'bezier', x: 25, y: 0, c1x: 10, c1y: 35, c2x: 25, c2y: 35 },
    { type: 'bezier', x: 0, y: -10, c1x: 25, c1y: -10, c2x: 10, c2y: -10 },
    { type: 'bezier', x: -25, y: 0, c1x: -10, c1y: -10, c2x: -25, c2y: -10 }
  ]),
  E: new Path([
    { type: 'move', x: -30, y: 0 },
    { type: 'bezier', x: 0, y: 15, c1x: -30, c1y: 15, c2x: -10, c2y: 15 },
    { type: 'bezier', x: 30, y: 0, c1x: 10, c1y: 15, c2x: 30, c2y: 15 },
    { type: 'bezier', x: 0, y: -5, c1x: 30, c1y: -5, c2x: 10, c2y: -5 },
    { type: 'bezier', x: -30, y: 0, c1x: -10, c1y: -5, c2x: -30, c2y: -5 }
  ])
};
