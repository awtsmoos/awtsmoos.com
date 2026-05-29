// B"H
import { P, L } from '../levelPrimitives.js';
import { malchusPlatforms, malchusRotors, malchusTricks } from './level01-malchus/terrain.js';
import { malchusCoins, malchusKeys, malchusSpikes, malchusEnemies, malchusExtra } from './level01-malchus/actors.js';
import { malchusTriggers, malchusLore } from './level01-malchus/story.js';

/**
 * Malchus Gate of Dust.
 *
 * The Awtsmoos split the first chamber into terrain, actors, and story. The
 * gate still teaches distrust without cruelty collapsing into nonsense, but now
 * each shelf of data can be manually inspected like a clean stone tablet.
 */
export const level01 = L(
  '1 · Malchus Gate of Dust',
  2200,
  { x: 60, y: 420 },
  P(2050, 360, 44, 90),
  'Malchus tests simple honesty before cruelty: do not trust every coin.',
  malchusPlatforms,
  malchusRotors,
  malchusTricks,
  malchusCoins,
  malchusKeys,
  malchusSpikes,
  malchusEnemies,
  malchusTriggers,
  malchusLore,
  malchusExtra
);
