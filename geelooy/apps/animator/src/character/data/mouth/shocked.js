/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const SHOCKED_MOUTH = {
  closed: new Path([
    { type: 'move', x: -10, y: 0 },
    { type: 'bezier', x: 10, y: 0, c1x: -5, c1y: 5, c2x: 5, c2y: 5 },
    { type: 'bezier', x: -10, y: 0, c1x: 5, c1y: -5, c2x: -5, c2y: -5 }
  ]),
  open: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 25, y: 0, c1x: -25, c1y: 80, c2x: 25, c2y: 80 },
    { type: 'bezier', x: -25, y: 0, c1x: 25, c1y: -80, c2x: -25, c2y: -80 }
  ])
};
