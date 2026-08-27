/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const DISGUSTED_MOUTH = {
  closed: new Path([
    { type: 'move', x: -25, y: 5 },
    { type: 'bezier', x: 25, y: 0, c1x: -15, c1y: -10, c2x: 10, c2y: 10 },
    { type: 'bezier', x: -25, y: 5, c1x: 10, c1y: 5, c2x: -15, c2y: 0 }
  ]),
  open: new Path([
    { type: 'move', x: -30, y: 10 },
    { type: 'bezier', x: 30, y: 5, c1x: -20, c1y: 40, c2x: 20, c2y: 30 },
    { type: 'bezier', x: -30, y: 10, c1x: 20, c1y: -20, c2x: -20, c2y: -10 }
  ])
};
