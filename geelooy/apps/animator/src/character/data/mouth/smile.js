/* B”H */
import { Path } from '../../../utils/geom/Path.js';

export const SMILE_MOUTH = {
  closed: new Path([
    { type: 'move', x: -35, y: -10 },
    { type: 'bezier', x: 35, y: -10, c1x: -20, c1y: 25, c2x: 20, c2y: 25 },
    { type: 'bezier', x: -35, y: -10, c1x: 20, c1y: -5, c2x: -20, c2y: -5 }
  ]),
  open: new Path([
    { type: 'move', x: -40, y: -15 },
    { type: 'bezier', x: 40, y: -15, c1x: -30, c1y: 70, c2x: 30, c2y: 70 },
    { type: 'bezier', x: -40, y: -15, c1x: 30, c1y: -10, c2x: -30, c2y: -10 }
  ])
};
