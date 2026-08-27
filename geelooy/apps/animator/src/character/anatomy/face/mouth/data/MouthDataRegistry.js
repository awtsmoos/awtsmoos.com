
// B"H
import { EmotionNeutral } from './emotions/Neutral.js';
import { EmotionSmile } from './emotions/Smile.js';
import { PhonemeA } from './phonemes/vowels/A.js';
import { PhonemeE } from './phonemes/vowels/E.js';
import { PhonemeO } from './phonemes/vowels/O.js';

/**
 * @file MouthDataRegistry.js
 * @description
 * CHAPTER: THE GATHERING OF THE UTTERANCES (Kibbutz HaMa'amarot)
 * B"H
 * 
 * Provides the Keter (Crown) that unites all 16-point geometric lips into 
 * a single accessible object for the MouthEngine.
 * 
 * RECTIFIED: The 'L' phoneme has been liberated from the 'T' alias. It now 
 * boasts a massive upper-palate exposure dedicated specifically to letting 
 * the Tongue renderer arch up to strike the incisors visibly!
 */

const PhonemeT = {
  outerUpper: [ {x: -25, y: -2}, {x: -12, y: -18}, {x: 12, y: -18}, {x: 25, y: -2} ],
  outerLower: [ {x: -25, y: -2}, {x: -10, y: 15},  {x: 10, y: 15},  {x: 25, y: -2} ],
  innerUpper: [ {x: -20, y: -1}, {x: -10, y: -12}, {x: 10, y: -12}, {x: 20, y: -1} ],
  innerLower: [ {x: -20, y: -1}, {x: -8, y: 8},    {x: 8, y: 8},    {x: 20, y: -1} ]
};

const PhonemeS = {
  outerUpper: [ {x: -30, y: -2}, {x: -15, y: -10}, {x: 15, y: -10}, {x: 30, y: -2} ],
  outerLower: [ {x: -30, y: -2}, {x: -15, y: 12},  {x: 15, y: 12},  {x: 30, y: -2} ],
  innerUpper: [ {x: -26, y: -1}, {x: -12, y: -4},  {x: 12, y: -4},  {x: 26, y: -1} ],
  innerLower: [ {x: -26, y: -1}, {x: -12, y: 4},   {x: 12, y: 4},   {x: 26, y: -1} ]
};

const PhonemeM = {
  outerUpper: [ {x: -28, y: -2}, {x: -12, y: -4},  {x: 12, y: -4},  {x: 28, y: -2} ],
  outerLower: [ {x: -28, y: -2}, {x: -12, y: 4},   {x: 12, y: 4},   {x: 28, y: -2} ],
  innerUpper: [ {x: -24, y: 0},  {x: -10, y: -1},  {x: 10, y: -1},  {x: 24, y: 0} ],
  innerLower: [ {x: -24, y: 0},  {x: -10, y: 1},   {x: 10, y: 1},   {x: 24, y: 0} ]
};

// B"H - Unique 'L' Phoneme. Wide enough to let the red tongue shine through!
const PhonemeL = {
  outerUpper: [ {x: -22, y: -2}, {x: -10, y: -22}, {x: 10, y: -22}, {x: 22, y: -2} ],
  outerLower: [ {x: -22, y: -2}, {x: -10, y: 18},  {x: 10, y: 18},  {x: 22, y: -2} ],
  innerUpper: [ {x: -18, y: -1}, {x: -8, y: -15},  {x: 8, y: -15},  {x: 18, y: -1} ],
  innerLower: [ {x: -18, y: -1}, {x: -8, y: 10},   {x: 8, y: 10},   {x: 18, y: -1} ]
};

export const MouthDataRegistry = {
  neutral: EmotionNeutral,
  smile: EmotionSmile,
  A: PhonemeA,
  E: PhonemeE,
  O: PhonemeO,
  T: PhonemeT, // Te, De, Ne
  S: PhonemeS, // S, Z, C
  M: PhonemeM, // B, P, M
  L: PhonemeL  // B"H - Liberated! L commands the tongue to strike the palate.
};
