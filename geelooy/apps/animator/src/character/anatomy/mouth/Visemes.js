
/* B”H */
import { Path } from '../../../utils/geom/Path.js';

/**
 * @constant PHONETIC_VISEMES
 * @description
 * The Alphabet of the Infinite. These are intense, hyper-realistic 
 * phonetic shapes. They dictate not only the outer boundary of the lips,
 * but carry metadata to instruct the tongue and teeth how to manifest.
 */
export const PHONETIC_VISEMES = {
  // A wide open 'Ah' sound
  A: {
    points: new Path([
      { type: 'move', x: -35, y: 0 },
      { type: 'bezier', x: 0, y: 55, c1x: -30, c1y: 55, c2x: -10, c2y: 55 },
      { type: 'bezier', x: 35, y: 0, c1x: 10, c1y: 55, c2x: 30, c2y: 55 },
      { type: 'bezier', x: 0, y: -25, c1x: 30, c1y: -25, c2x: 10, c2y: -25 },
      { type: 'bezier', x: -35, y: 0, c1x: -10, c1y: -25, c2x: -30, c2y: -25 }
    ]),
    teeth: 0.8, tongue: 0.2
  },
  // A tight, rounded 'Oh' sound
  O: {
    points: new Path([
      { type: 'move', x: -20, y: 0 },
      { type: 'bezier', x: 0, y: 30, c1x: -20, c1y: 30, c2x: -10, c2y: 30 },
      { type: 'bezier', x: 20, y: 0, c1x: 10, c1y: 30, c2x: 20, c2y: 30 },
      { type: 'bezier', x: 0, y: -30, c1x: 20, c1y: -30, c2x: 10, c2y: -30 },
      { type: 'bezier', x: -20, y: 0, c1x: -10, c1y: -30, c2x: -20, c2y: -30 }
    ]),
    teeth: 0.0, tongue: 0.0
  },
  // The 'Eee' sound, lips pulled back, teeth bared
  E: {
    points: new Path([
      { type: 'move', x: -40, y: 0 },
      { type: 'bezier', x: 0, y: 15, c1x: -35, c1y: 15, c2x: -10, c2y: 15 },
      { type: 'bezier', x: 40, y: 0, c1x: 10, c1y: 15, c2x: 35, c2y: 15 },
      { type: 'bezier', x: 0, y: -10, c1x: 35, c1y: -10, c2x: 10, c2y: -10 },
      { type: 'bezier', x: -40, y: 0, c1x: -10, c1y: -10, c2x: -35, c2y: -10 }
    ]),
    teeth: 1.0, tongue: 0.0
  },
  // The 'Mmm' sound, lips sealed tight
  M: {
    points: new Path([
      { type: 'move', x: -30, y: 0 },
      { type: 'bezier', x: 0, y: 2, c1x: -20, c1y: 2, c2x: -10, c2y: 2 },
      { type: 'bezier', x: 30, y: 0, c1x: 10, c1y: 2, c2x: 20, c2y: 2 },
      { type: 'bezier', x: 0, y: -2, c1x: 20, c1y: -2, c2x: 10, c2y: -2 },
      { type: 'bezier', x: -30, y: 0, c1x: -10, c1y: -2, c2x: -20, c2y: -2 }
    ]),
    teeth: 0.0, tongue: 0.0
  },
  // The 'L' sound, tongue touching the roof of the mouth
  L: {
    points: new Path([
      { type: 'move', x: -30, y: 0 },
      { type: 'bezier', x: 0, y: 25, c1x: -25, c1y: 25, c2x: -10, c2y: 25 },
      { type: 'bezier', x: 30, y: 0, c1x: 10, c1y: 25, c2x: 25, c2y: 25 },
      { type: 'bezier', x: 0, y: -15, c1x: 25, c1y: -15, c2x: 10, c2y: -15 },
      { type: 'bezier', x: -30, y: 0, c1x: -10, c1y: -15, c2x: -25, c2y: -15 }
    ]),
    teeth: 0.5, tongue: 1.0
  }
};
