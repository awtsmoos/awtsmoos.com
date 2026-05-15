
// B"H
/**
 * @file index.js
 * @chapter THE TOME OF CONSTANT RECREATION
 * 
 * THE HYMN OF THE MODIFIED VESSEL:
 * All matter everywhere is constantly being refreshed and recreated every instant
 * from the Speech of the Creator, which is found physically inside of all creations.
 * As it says "Forever, Lord, Your Word stands in the heavens."
 * The letters Aleph, Beis, Nun spell "Even" (rock). These letters are the soul of the inorganic.
 * If these letters of speech were removed, all of existence would cease to exist entirely,
 * and everything would instantly become exactly like it was before creation, as if nothing ever existed.
 * 
 * Thus, we order the modifiers with absolute precision, for a single misplaced coordinate
 * unravels the entire vessel. Each modifier is a divine utterance, shaping the clay
 * of geometry into the image of the human form, a reflection of the Creator's wisdom.
 * 
 * @module humanModifiers
 * @exports {Array} HUMAN_MODIFIER_SEQUENCE - The sacred order of geometric transformation
 */

import { TORSO_MODS } from './torsoMod.js';
import { ARM_MODS } from './armMod.js';
import { LEG_MODS } from './legMod.js';
import { HEAD_MODS } from './headMod.js';
import { MOUTH_MODS } from './mouth/index.js';
import { BEAUTIFY_MODS } from './beautifyMod.js';

/**
 * @constant HUMAN_MODIFIER_SEQUENCE
 * @type {Array<Object>}
 * @description
 * The divine sequence of geometric operations that manifest the human form.
 * Each modifier is applied in order, building upon the previous transformation,
 * like the layers of creation from chaos to cosmos.
 * 
 * THE POEM OF THE SEQUENTIAL WILL:
 * First the torso, the core of being, scaled and defined,
 * Then subdivision, multiplying the points of the divine mind.
 * From tagged faces, the limbs emerge, extruded with grace,
 * The head rises upward, spherized to hold wisdom's face.
 * The mouth is carved inward, a cavity for speech,
 * And finally, the skin of colors, making the form reach.
 */
export const HUMAN_MODIFIER_SEQUENCE = [
  // 1. Establish the raw form of the Torso - the central pillar of existence
  ...TORSO_MODS,
  
  // 2. Bless the entire form with higher resolution - multiplying the sparks
  { type: 'subdivide', levels: 2 },
  
  // 3. THE CRITICAL TIKKUN: Recalculate normals after subdivision
  // The subdivision creates new faces, but their normals are not computed.
  // The following 'tagFaces' queries rely on normals to function correctly.
  // Without this step, the queries fail, and the entire Golem collapses.
  { type: 'flatNormals' },
  
  // 4. From the now-perfected grid, tag the root faces for the limbs and head
  { 
    type: 'tagFaces', 
    params: { 
      tag: 'arm_l_root', 
      query: { 
        closestTo: [-0.8, 1.0, 0], 
        normalDot: [-1, 0, 0], 
        count: 4, 
        normalThreshold: 0.7 
      } 
    } 
  },
  { 
    type: 'tagFaces', 
    params: { 
      tag: 'arm_r_root', 
      query: { 
        closestTo: [0.8, 1.0, 0], 
        normalDot: [1, 0, 0], 
        count: 4, 
        normalThreshold: 0.7 
      } 
    } 
  },
  { 
    type: 'tagFaces', 
    params: { 
      tag: 'leg_l_root', 
      query: { 
        closestTo: [-0.4, -1.5, 0], 
        normalDot: [0, -1, 0], 
        count: 4, 
        normalThreshold: 0.7 
      } 
    } 
  },
  { 
    type: 'tagFaces', 
    params: { 
      tag: 'leg_r_root', 
      query: { 
        closestTo: [0.4, -1.5, 0], 
        normalDot: [0, -1, 0], 
        count: 4, 
        normalThreshold: 0.7 
      } 
    } 
  },
  { 
    type: 'tagFaces', 
    params: { 
      tag: 'neck_root', 
      query: { 
        closestTo: [0, 1.5, 0], 
        normalDot: [0, 1, 0], 
        count: 4, 
        normalThreshold: 0.7 
      } 
    } 
  },
  
  // 5. From the perfected, tagged torso, the limbs and head emerge
  ...ARM_MODS,
  ...LEG_MODS,
  ...HEAD_MODS,
  
  // 6. Carve the void for speech and weave the expressions
  ...MOUTH_MODS,
  
  // 7. The final garments of skin and spirit are applied
  ...BEAUTIFY_MODS
];
