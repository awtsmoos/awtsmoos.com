/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const SAD_MOUTH = {
  closed: new Path([
    { type: 'move', x: -25, y: 10 },
    { type: 'bezier', x: 25, y: 10, c1x: -10, c1y: -5, c2x: 10, c2y: -5 },
    { type: 'bezier', x: -25, y: 10, c1x: 10, c1y: 15, c2x: -10, c2y: 15 }
  ]),
  open: new Path([
    { type: 'move', x: -25, y: 10 },
    { type: 'bezier', x: 25, y: 10, c1x: -20, c1y: 50, c2x: 20, c2y: 50 },
    { type: 'bezier', x: -25, y: 10, c1x: 15, c1y: -10, c2x: -15, c2y: -10 }
  ])
};
