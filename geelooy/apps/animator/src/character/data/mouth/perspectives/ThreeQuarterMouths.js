
/* B”H */
import { Path } from '../../../../utils/geom/Path.js';

/**
 * @constant THREE_QUARTER_MOUTHS
 * @description
 * THE ZAIR ANPIN (Small Face) VISEMES - STRICT 5-POINT TOPOLOGY.
 * Skewed paths wrapping the muzzle, fully compatible with Path.interpolate().
 */
export const THREE_QUARTER_MOUTHS = {
  neutral: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 0, y: -2, c1x: -10, c1y: -2, c2x: -5, c2y: -2 },
    { type: 'bezier', x: 25, y: -5, c1x: 5, c1y: -4, c2x: 15, c2y: -5 },
    { type: 'bezier', x: 0, y: 2, c1x: 15, c1y: 2, c2x: 5, c2y: 2 },
    { type: 'bezier', x: -20, y: 0, c1x: -5, c1y: 2, c2x: -10, c2y: 2 }
  ]),
  smile: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: 0, y: -8, c1x: -10, c1y: -8, c2x: -5, c2y: -8 },
    { type: 'bezier', x: 30, y: -15, c1x: 5, c1y: -12, c2x: 20, c2y: -15 },
    { type: 'bezier', x: 0, y: 10, c1x: 20, c1y: 5, c2x: 10, c2y: 10 },
    { type: 'bezier', x: -25, y: -5, c1x: -10, c1y: 10, c2x: -15, c2y: 5 }
  ]),
  A: new Path([
    { type: 'move', x: -20, y: -5 },
    { type: 'bezier', x: 0, y: -15, c1x: -10, c1y: -15, c2x: -5, c2y: -15 },
    { type: 'bezier', x: 25, y: -15, c1x: 5, c1y: -15, c2x: 15, c2y: -15 },
    { type: 'bezier', x: 0, y: 30, c1x: 15, c1y: 30, c2x: 5, c2y: 30 },
    { type: 'bezier', x: -20, y: -5, c1x: -5, c1y: 30, c2x: -15, c2y: 15 }
  ]),
  O: new Path([
    { type: 'move', x: -10, y: -5 },
    { type: 'bezier', x: 5, y: -25, c1x: -5, c1y: -25, c2x: 0, c2y: -25 },
    { type: 'bezier', x: 20, y: -10, c1x: 10, c1y: -20, c2x: 15, c2y: -15 },
    { type: 'bezier', x: 5, y: 20, c1x: 15, c1y: 20, c2x: 10, c2y: 20 },
    { type: 'bezier', x: -10, y: -5, c1x: 0, c1y: 20, c2x: -5, c2y: 10 }
  ]),
  E: new Path([
    { type: 'move', x: -30, y: -5 },
    { type: 'bezier', x: 0, y: -15, c1x: -15, c1y: -15, c2x: -5, c2y: -15 },
    { type: 'bezier', x: 35, y: -10, c1x: 5, c1y: -15, c2x: 20, c2y: -10 },
    { type: 'bezier', x: 0, y: 10, c1x: 20, c1y: 10, c2x: 10, c2y: 10 },
    { type: 'bezier', x: -30, y: -5, c1x: -10, c1y: 10, c2x: -20, c2y: 5 }
  ]),
  M: new Path([
    { type: 'move', x: -20, y: -2 },
    { type: 'bezier', x: 0, y: -5, c1x: -10, c1y: -5, c2x: -5, c2y: -5 },
    { type: 'bezier', x: 25, y: -6, c1x: 5, c1y: -5, c2x: 15, c2y: -6 },
    { type: 'bezier', x: 0, y: 0, c1x: 15, c1y: 0, c2x: 5, c2y: 0 },
    { type: 'bezier', x: -20, y: -2, c1x: -5, c1y: 0, c2x: -10, c2y: -1 }
  ]),
  L: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 0, y: -15, c1x: -10, c1y: -15, c2x: -5, c2y: -15 },
    { type: 'bezier', x: 25, y: -10, c1x: 5, c1y: -15, c2x: 15, c2y: -10 },
    { type: 'bezier', x: 0, y: 15, c1x: 15, c1y: 15, c2x: 5, c2y: 15 },
    { type: 'bezier', x: -15, y: -5, c1x: -5, c1y: 15, c2x: -10, c2y: 5 }
  ])
};
