// B"H
import { P, L } from '../levelPrimitives.js';
import { hodPlatforms, hodRotors, hodTricks } from './level03-hod/terrain.js';
import { hodCoins, hodKeys, hodSpikes, hodEnemies, hodExtra } from './level03-hod/actors.js';
import { hodTriggers, hodLore } from './level03-hod/story.js';

/**
 * Hod Library of Arguments.
 *
 * The Awtsmoos split Hod into terrain, actors, and story after the blocked sky
 * route was exposed. Now the chamber can be audited shelf by shelf, while the
 * graph reachability test proves the upper path is more than decoration.
 */
export const level03 = L(
  '3 · Hod Library of Arguments',
  3000,
  { x: 60, y: 420 },
  P(2820, 260, 44, 90),
  'Hod argues with your eyes: regular shapes may be ghosts or teeth.',
  hodPlatforms,
  hodRotors,
  hodTricks,
  hodCoins,
  hodKeys,
  hodSpikes,
  hodEnemies,
  hodTriggers,
  hodLore,
  hodExtra
);
