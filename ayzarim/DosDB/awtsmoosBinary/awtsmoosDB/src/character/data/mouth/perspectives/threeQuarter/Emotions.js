
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

export const THREE_QUARTER_EMOTIONS = {
  neutral: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'line', x: 25, y: -5 }
  ]),
  smile: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: 30, y: -15, c1x: -10, c1y: 20, c2x: 20, c2y: 10 },
    { type: 'bezier', x: -25, y: -5, c1x: 20, c1y: -5, c2x: -10, c2y: -10 }
  ]),
  frown: new Path([
    { type: 'move', x: -25, y: 5 },
    { type: 'bezier', x: 30, y: 10, c1x: -10, c1y: -5, c2x: 15, c2y: 0 },
    { type: 'bezier', x: -25, y: 5, c1x: 15, c1y: 15, c2x: -10, c2y: 10 }
  ]),
  happy: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: 30, y: -10, c1x: -15, c1y: 35, c2x: 25, c2y: 25 },
    { type: 'bezier', x: -25, y: -5, c1x: 20, c1y: -15, c2x: -15, c2y: -10 }
  ]),
  sad: new Path([
    { type: 'move', x: -20, y: 5 },
    { type: 'bezier', x: 20, y: 10, c1x: -10, c1y: 25, c2x: 15, c2y: 25 },
    { type: 'bezier', x: -20, y: 5, c1x: 10, c1y: 0, c2x: -10, c2y: 0 }
  ]),
  angry: new Path([
    { type: 'move', x: -20, y: -5 },
    { type: 'bezier', x: 25, y: -2, c1x: -10, c1y: 15, c2x: 15, c2y: 15 },
    { type: 'bezier', x: -20, y: -5, c1x: 15, c1y: -10, c2x: -10, c2y: -10 }
  ])
};
