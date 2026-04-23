
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

/**
 * @constant SIDE_VISEMES
 * @description
 * THE LETTERS OF SPEECH - SIDE PERSPECTIVE.
 * Extreme abstract paths representing half the mouth, wrapping to the cheek.
 */
export const SIDE_VISEMES = {
  A: new Path([
    { type: 'move', x: -15, y: -10 },
    { type: 'bezier', x: 15, y: -5, c1x: -5, c1y: 25, c2x: 10, c2y: 15 },
    { type: 'bezier', x: -15, y: -10, c1x: 5, c1y: -25, c2x: -5, c2y: -20 }
  ]),
  O: new Path([
    { type: 'move', x: -5, y: -5 },
    { type: 'bezier', x: 20, y: 0, c1x: 0, c1y: 20, c2x: 15, c2y: 15 },
    { type: 'bezier', x: -5, y: -5, c1x: 15, c1y: -20, c2x: 0, c2y: -15 }
  ]),
  E: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: 15, y: -5, c1x: -10, c1y: 10, c2x: 5, c2y: 5 },
    { type: 'bezier', x: -25, y: -5, c1x: 5, c1y: -15, c2x: -10, c2y: -10 }
  ]),
  M: new Path([
    { type: 'move', x: -15, y: 0 },
    { type: 'bezier', x: 15, y: 0, c1x: -5, c1y: 5, c2x: 5, c2y: 5 },
    { type: 'bezier', x: -15, y: 0, c1x: 5, c1y: -5, c2x: -5, c2y: -5 }
  ]),
  L: new Path([
    { type: 'move', x: -15, y: -5 },
    { type: 'bezier', x: 15, y: -5, c1x: -5, c1y: 15, c2x: 5, c2y: 10 },
    { type: 'bezier', x: -15, y: -5, c1x: 5, c1y: -15, c2x: -5, c2y: -10 }
  ])
};
