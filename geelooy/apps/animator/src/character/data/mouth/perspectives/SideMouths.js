
/* B”H */
import { Path } from '../../../../utils/geom/Path.js';

/**
 * @constant SIDE_MOUTHS
 * @description
 * THE ACHORAIM (Back/Side) VISEMES - STRICT 5-POINT TOPOLOGY.
 */
export const SIDE_MOUTHS = {
  neutral: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: -5, y: -1, c1x: -15, c1y: -1, c2x: -10, c2y: -1 },
    { type: 'bezier', x: 10, y: 0, c1x: 0, c1y: -1, c2x: 5, c2y: -1 },
    { type: 'bezier', x: -5, y: 1, c1x: 5, c1y: 1, c2x: 0, c2y: 1 },
    { type: 'bezier', x: -20, y: 0, c1x: -10, c1y: 1, c2x: -15, c2y: 1 }
  ]),
  smile: new Path([
    { type: 'move', x: -20, y: -5 },
    { type: 'bezier', x: -5, y: -10, c1x: -15, c1y: -8, c2x: -10, c2y: -10 },
    { type: 'bezier', x: 15, y: -15, c1x: 0, c1y: -10, c2x: 10, c2y: -15 },
    { type: 'bezier', x: -5, y: 5, c1x: 10, c1y: 0, c2x: 0, c2y: 5 },
    { type: 'bezier', x: -20, y: -5, c1x: -10, c1y: 5, c2x: -15, c2y: 0 }
  ]),
  A: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 0, y: -15, c1x: -10, c1y: -10, c2x: -5, c2y: -15 },
    { type: 'bezier', x: 15, y: -5, c1x: 5, c1y: -15, c2x: 10, c2y: -10 },
    { type: 'bezier', x: 0, y: 20, c1x: 10, c1y: 15, c2x: 5, c2y: 20 },
    { type: 'bezier', x: -15, y: -5, c1x: -5, c1y: 20, c2x: -10, c2y: 10 }
  ]),
  O: new Path([
    { type: 'move', x: -5, y: -5 },
    { type: 'bezier', x: 5, y: -15, c1x: 0, c1y: -10, c2x: 0, c2y: -15 },
    { type: 'bezier', x: 20, y: 0, c1x: 10, c1y: -15, c2x: 15, c2y: -5 },
    { type: 'bezier', x: 5, y: 15, c1x: 15, c1y: 10, c2x: 10, c2y: 15 },
    { type: 'bezier', x: -5, y: -5, c1x: 0, c1y: 15, c2x: 0, c2y: 5 }
  ]),
  E: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: -5, y: -10, c1x: -15, c1y: -10, c2x: -10, c2y: -10 },
    { type: 'bezier', x: 15, y: -5, c1x: 0, c1y: -10, c2x: 10, c2y: -10 },
    { type: 'bezier', x: -5, y: 5, c1x: 10, c1y: 5, c2x: 0, c2y: 5 },
    { type: 'bezier', x: -25, y: -5, c1x: -10, c1y: 5, c2x: -15, c2y: 0 }
  ]),
  M: new Path([
    { type: 'move', x: -15, y: 0 },
    { type: 'bezier', x: 0, y: -2, c1x: -10, c1y: -2, c2x: -5, c2y: -2 },
    { type: 'bezier', x: 15, y: 0, c1x: 5, c1y: -2, c2x: 10, c2y: -2 },
    { type: 'bezier', x: 0, y: 2, c1x: 10, c1y: 2, c2x: 5, c2y: 2 },
    { type: 'bezier', x: -15, y: 0, c1x: -5, c1y: 2, c2x: -10, c2y: 2 }
  ]),
  L: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 0, y: -10, c1x: -10, c1y: -10, c2x: -5, c2y: -10 },
    { type: 'bezier', x: 15, y: -5, c1x: 5, c1y: -10, c2x: 10, c2y: -10 },
    { type: 'bezier', x: 0, y: 10, c1x: 10, c1y: 10, c2x: 5, c2y: 10 },
    { type: 'bezier', x: -15, y: -5, c1x: -5, c1y: 10, c2x: -10, c2y: 5 }
  ])
};
