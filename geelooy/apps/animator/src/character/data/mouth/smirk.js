/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const SMIRK_MOUTH = {
  closed: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 25, y: -10, c1x: -10, c1y: 5, c2x: 15, c2y: -15 },
    { type: 'bezier', x: -20, y: 0, c1x: 15, c1y: -5, c2x: -10, c2y: 5 }
  ]),
  open: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 30, y: -15, c1x: -10, c1y: 30, c2x: 25, c2y: 10 },
    { type: 'bezier', x: -20, y: 0, c1x: 25, c1y: -20, c2x: -10, c2y: -5 }
  ])
};
