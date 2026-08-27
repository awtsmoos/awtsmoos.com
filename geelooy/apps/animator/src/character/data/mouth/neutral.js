/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const NEUTRAL_MOUTH = {
  closed: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: 2, c1x: -12, c1y: 2, c2x: -6, c2y: 2 },
    { type: 'bezier', x: 25, y: 0, c1x: 6, c1y: 2, c2x: 12, c2y: 2 },
    { type: 'bezier', x: 0, y: -2, c1x: 12, c1y: -2, c2x: 6, c2y: -2 },
    { type: 'bezier', x: -25, y: 0, c1x: -6, c1y: -2, c2x: -12, c2y: -2 }
  ]),
  open: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 0, y: 45, c1x: -20, c1y: 45, c2x: -10, c2y: 45 },
    { type: 'bezier', x: 20, y: 0, c1x: 10, c1y: 45, c2x: 20, c2y: 45 },
    { type: 'bezier', x: 0, y: -25, c1x: 20, c1y: -25, c2x: 10, c2y: -25 },
    { type: 'bezier', x: -20, y: 0, c1x: -10, c1y: -25, c2x: -20, c2y: -25 }
  ])
};
