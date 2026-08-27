/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const RELIEF_MOUTH = {
  closed: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 20, y: 0, c1x: -10, c1y: 5, c2x: 10, c2y: 5 },
    { type: 'bezier', x: -20, y: 0, c1x: 10, c1y: -2, c2x: -10, c2y: -2 }
  ]),
  open: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 25, y: 0, c1x: -15, c1y: 30, c2x: 15, c2y: 30 },
    { type: 'bezier', x: -25, y: 0, c1x: 15, c1y: -10, c2x: -15, c2y: -10 }
  ])
};
