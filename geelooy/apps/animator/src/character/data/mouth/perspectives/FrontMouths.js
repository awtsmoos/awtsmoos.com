
/* B”H */
import { Path } from '../../../../utils/geom/Path.js';

/**
 * @constant FRONT_MOUTHS
 * @description
 * THE PANIM (Face) VISEMES - STRICT 5-POINT TOPOLOGY.
 * To achieve true mathematical morphing (Tikkun), every shape MUST share the 
 * exact same number of geometric points.
 * Point 1: Move to Left Corner
 * Point 2: Bezier to Top Lip
 * Point 3: Bezier to Right Corner
 * Point 4: Bezier to Bottom Lip
 * Point 5: Bezier back to Left Corner
 */
export const FRONT_MOUTHS = {
  neutral: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: -2, c1x: -15, c1y: -2, c2x: -5, c2y: -2 },
    { type: 'bezier', x: 25, y: 0, c1x: 5, c1y: -2, c2x: 15, c2y: -2 },
    { type: 'bezier', x: 0, y: 2, c1x: 15, c1y: 2, c2x: 5, c2y: 2 },
    { type: 'bezier', x: -25, y: 0, c1x: -5, c1y: 2, c2x: -15, c2y: 2 }
  ]),
  smile: new Path([
    { type: 'move', x: -35, y: -10 },
    { type: 'bezier', x: 0, y: -5, c1x: -20, c1y: -5, c2x: -10, c2y: -5 },
    { type: 'bezier', x: 35, y: -10, c1x: 10, c1y: -5, c2x: 20, c2y: -5 },
    { type: 'bezier', x: 0, y: 15, c1x: 20, c1y: 15, c2x: 10, c2y: 15 },
    { type: 'bezier', x: -35, y: -10, c1x: -10, c1y: 15, c2x: -20, c2y: 15 }
  ]),
  A: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: -15, c1x: -15, c1y: -15, c2x: -5, c2y: -15 },
    { type: 'bezier', x: 25, y: 0, c1x: 5, c1y: -15, c2x: 15, c2y: -15 },
    { type: 'bezier', x: 0, y: 40, c1x: 15, c1y: 40, c2x: 5, c2y: 40 },
    { type: 'bezier', x: -25, y: 0, c1x: -5, c1y: 40, c2x: -15, c2y: 40 }
  ]),
  O: new Path([
    { type: 'move', x: -15, y: 0 },
    { type: 'bezier', x: 0, y: -25, c1x: -10, c1y: -25, c2x: -5, c2y: -25 },
    { type: 'bezier', x: 15, y: 0, c1x: 5, c1y: -25, c2x: 10, c2y: -25 },
    { type: 'bezier', x: 0, y: 25, c1x: 10, c1y: 25, c2x: 5, c2y: 25 },
    { type: 'bezier', x: -15, y: 0, c1x: -5, c1y: 25, c2x: -10, c2y: 25 }
  ]),
  E: new Path([
    { type: 'move', x: -35, y: 0 },
    { type: 'bezier', x: 0, y: -10, c1x: -20, c1y: -10, c2x: -10, c2y: -10 },
    { type: 'bezier', x: 35, y: 0, c1x: 10, c1y: -10, c2x: 20, c2y: -10 },
    { type: 'bezier', x: 0, y: 10, c1x: 20, c1y: 10, c2x: 10, c2y: 10 },
    { type: 'bezier', x: -35, y: 0, c1x: -10, c1y: 10, c2x: -20, c2y: 10 }
  ]),
  M: new Path([
    { type: 'move', x: -25, y: 0 },
    { type: 'bezier', x: 0, y: -2, c1x: -15, c1y: -2, c2x: -5, c2y: -2 },
    { type: 'bezier', x: 25, y: 0, c1x: 5, c1y: -2, c2x: 15, c2y: -2 },
    { type: 'bezier', x: 0, y: 2, c1x: 15, c1y: 2, c2x: 5, c2y: 2 },
    { type: 'bezier', x: -25, y: 0, c1x: -5, c1y: 2, c2x: -15, c2y: 2 }
  ]),
  L: new Path([
    { type: 'move', x: -20, y: 0 },
    { type: 'bezier', x: 0, y: -10, c1x: -10, c1y: -10, c2x: -5, c2y: -10 },
    { type: 'bezier', x: 20, y: 0, c1x: 5, c1y: -10, c2x: 10, c2y: -10 },
    { type: 'bezier', x: 0, y: 20, c1x: 10, c1y: 20, c2x: 5, c2y: 20 },
    { type: 'bezier', x: -20, y: 0, c1x: -5, c1y: 20, c2x: -10, c2y: 20 }
  ])
};
