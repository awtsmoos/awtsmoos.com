
/* B”H */
import { Path } from '../../../../../utils/geom/Path.js';

/**
 * @constant FRONT_EMOTIONS
 * @description
 * THE MIDDOS (Emotions) - FRONT PERSPECTIVE.
 * The emotional states of the soul manifested through the curvature of the lips.
 */
export const FRONT_EMOTIONS = {
  neutral: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'line', x: 25, y: 0 }
  ]),
  smile: new Path([
    { type: 'move', x: -35, y: -10 },
    { type: 'bezier', x: 35, y: -10, c1x: -20, c1y: 25, c2x: 20, c2y: 25 },
    { type: 'bezier', x: -35, y: -10, c1x: 20, c1y: -5, c2x: -20, c2y: -5 }
  ]),
  frown: new Path([
    { type: 'move', x: -30, y: 15 },
    { type: 'bezier', x: 30, y: 15, c1x: -15, c1y: -15, c2x: 15, c2y: -15 },
    { type: 'bezier', x: -30, y: 15, c1x: 15, c1y: 20, c2x: -15, c2y: 20 }
  ]),
  happy: new Path([
    { type: 'move', x: -35, y: -5 },
    { type: 'bezier', x: 35, y: -5, c1x: -20, c1y: 40, c2x: 20, c2y: 40 },
    { type: 'bezier', x: -35, y: -5, c1x: 20, c1y: -10, c2x: -20, c2y: -10 }
  ]),
  sad: new Path([
    { type: 'move', x: -25, y: 10 },
    { type: 'bezier', x: 25, y: 10, c1x: -10, c1y: 30, c2x: 10, c2y: 30 },
    { type: 'bezier', x: -25, y: 10, c1x: 10, c1y: 0, c2x: -10, c2y: 0 }
  ]),
  angry: new Path([
    { type: 'move', x: -25, y: -5 },
    { type: 'bezier', x: 25, y: -5, c1x: -15, c1y: 20, c2x: 15, c2y: 20 },
    { type: 'bezier', x: -25, y: -5, c1x: 20, c1y: -10, c2x: -15, c2y: -10 }
  ]),
  disgusted: new Path([
    { type: 'move', x: -30, y: 5 },
    { type: 'bezier', x: 30, y: 0, c1x: -20, c1y: 30, c2x: 20, c2y: 20 },
    { type: 'bezier', x: -30, y: 5, c1x: 20, c1y: -10, c2x: -20, c2y: -5 }
  ])
};
