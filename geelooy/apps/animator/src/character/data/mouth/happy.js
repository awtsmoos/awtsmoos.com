/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const HAPPY_MOUTH = {
  closed: new Path([
    { type: 'move', x: -30, y: -5 },
    { type: 'bezier', x: 30, y: -5, c1x: -15, c1y: 20, c2x: 15, c2y: 20 },
    { type: 'bezier', x: -30, y: -5, c1x: 15, c1y: -5, c2x: -15, c2y: -5 }
  ]),
  open: new Path([
    { type: 'move', x: -35, y: -10 },
    { type: 'bezier', x: 35, y: -10, c1x: -25, c1y: 60, c2x: 25, c2y: 60 },
    { type: 'bezier', x: -35, y: -10, c1x: 25, c1y: -15, c2x: -25, c2y: -15 }
  ])
};
