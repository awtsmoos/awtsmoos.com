/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const FROWN_MOUTH = {
  closed: new Path([
    { type: 'move', x: -30, y: 15 },
    { type: 'bezier', x: 30, y: 15, c1x: -15, c1y: -15, c2x: 15, c2y: -15 },
    { type: 'bezier', x: -30, y: 15, c1x: 15, c1y: 20, c2x: -15, c2y: 20 }
  ]),
  open: new Path([
    { type: 'move', x: -30, y: 15 },
    { type: 'bezier', x: 30, y: 15, c1x: -25, c1y: 60, c2x: 25, c2y: 60 },
    { type: 'bezier', x: -30, y: 15, c1x: 20, c1y: -30, c2x: -20, c2y: -30 }
  ])
};
