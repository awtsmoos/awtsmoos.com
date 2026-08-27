
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

export const THREE_QUARTER_VISEMES = {
  A: new Path([
    { type: 'move', x: -20, y: -10 },
    { type: 'bezier', x: 10, y: 25, c1x: -20, c1y: 25, c2x: 0, c2y: 25 },
    { type: 'bezier', x: 25, y: -15, c1x: 20, c1y: 25, c2x: 25, c2y: 15 },
    { type: 'bezier', x: 10, y: -20, c1x: 20, c1y: -25, c2x: 15, c2y: -20 },
    { type: 'bezier', x: -20, y: -10, c1x: 0, c1y: -15, c2x: -15, c2y: -10 }
  ]),
  O: new Path([
    { type: 'move', x: -10, y: -5 },
    { type: 'bezier', x: 5, y: 20, c1x: -10, c1y: 20, c2x: 0, c2y: 20 },
    { type: 'bezier', x: 20, y: -10, c1x: 15, c1y: 20, c2x: 20, c2y: 10 },
    { type: 'bezier', x: 5, y: -25, c1x: 15, c1y: -25, c2x: 10, c2y: -25 },
    { type: 'bezier', x: -10, y: -5, c1x: 0, c1y: -20, c2x: -5, c2y: -10 }
  ]),
  E: new Path([
    { type: 'move', x: -30, y: -5 },
    { type: 'bezier', x: 0, y: 10, c1x: -25, c1y: 10, c2x: -10, c2y: 10 },
    { type: 'bezier', x: 35, y: -10, c1x: 15, c1y: 10, c2x: 30, c2y: 5 },
    { type: 'bezier', x: 0, y: -15, c1x: 25, c1y: -20, c2x: 10, c2y: -15 },
    { type: 'bezier', x: -30, y: -5, c1x: -10, c1y: -10, c2x: -25, c2y: -5 }
  ]),
  M: new Path([
    { type: 'move', x: -20, y: -2 },
    { type: 'bezier', x: 0, y: 3, c1x: -15, c1y: 3, c2x: -5, c2y: 3 },
    { type: 'bezier', x: 25, y: -6, c1x: 10, c1y: 3, c2x: 20, c2y: -2 },
    { type: 'bezier', x: 0, y: -7, c1x: 15, c1y: -8, c2x: 5, c2y: -7 },
    { type: 'bezier', x: -20, y: -2, c1x: -10, c1y: -5, c2x: -15, c2y: -3 }
  ]),
  L: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 0, y: 15, c1x: -15, c1y: 15, c2x: -5, c2y: 15 },
    { type: 'bezier', x: 25, y: -10, c1x: 10, c1y: 15, c2x: 20, c2y: 5 },
    { type: 'bezier', x: 0, y: -20, c1x: 15, c1y: -20, c2x: 5, c2y: -20 },
    { type: 'bezier', x: -15, y: -5, c1x: -5, c1y: -15, c2x: -10, c2y: -10 }
  ])
};
