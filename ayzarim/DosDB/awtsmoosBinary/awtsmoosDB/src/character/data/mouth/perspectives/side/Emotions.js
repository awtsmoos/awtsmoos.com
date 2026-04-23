
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

export const SIDE_EMOTIONS = {
  neutral: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'line', x: 10, y: 0 }
  ]),
  smile: new Path([
    { type: 'move', x: -20, y: -5 },
    { type: 'bezier', x: 15, y: -15, c1x: 0, c1y: 10, c2x: 10, c2y: 5 },
    { type: 'bezier', x: -20, y: -5, c1x: 10, c1y: -5, c2x: 0, c2y: -10 }
  ]),
  frown: new Path([
    { type: 'move', x: -20, y: 5 },
    { type: 'bezier', x: 15, y: 15, c1x: -5, c1y: -5, c2x: 5, c2y: 0 },
    { type: 'bezier', x: -20, y: 5, c1x: 5, c1y: 15, c2x: -5, c2y: 15 }
  ]),
  happy: new Path([
    { type: 'move', x: -20, y: -5 },
    { type: 'bezier', x: 20, y: -10, c1x: -5, c1y: 20, c2x: 15, c2y: 15 },
    { type: 'bezier', x: -20, y: -5, c1x: 15, c1y: -10, c2x: -5, c2y: -15 }
  ]),
  sad: new Path([
    { type: 'move', x: -15, y: 5 },
    { type: 'bezier', x: 10, y: 10, c1x: -5, c1y: 20, c2x: 5, c2y: 15 },
    { type: 'bezier', x: -15, y: 5, c1x: 5, c1y: 0, c2x: -5, c2y: 0 }
  ]),
  angry: new Path([
    { type: 'move', x: -20, y: -2 },
    { type: 'bezier', x: 15, y: -2, c1x: -10, c1y: 10, c2x: 10, c2y: 10 },
    { type: 'bezier', x: -20, y: -2, c1x: 10, c1y: -8, c2x: -10, c2y: -8 }
  ])
};
