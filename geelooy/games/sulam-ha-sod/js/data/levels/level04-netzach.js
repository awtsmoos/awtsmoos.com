// B"H
import { P, L } from '../levelPrimitives.js';
import { netzachPlatforms, netzachRotors, netzachTricks } from './level04-netzach/terrain.js';
import { netzachCoins, netzachKeys, netzachSpikes, netzachEnemies, netzachExtra } from './level04-netzach/actors.js';
import { netzachTriggers, netzachLore } from './level04-netzach/story.js';

/**
 * Netzach Sliding Garden.
 *
 * The Awtsmoos split this chamber into smaller scrolls: terrain, actors, and
 * story. The level remains one playable rung, but its code no longer carries
 * the whole garden in a single breath.
 */
export const level04 = L(
  '4 · Netzach Sliding Garden',
  3400,
  { x: 60, y: 420 },
  P(3220, 350, 44, 90),
  'Netzach teaches momentum: once you commit, the path keeps pulling.',
  netzachPlatforms,
  netzachRotors,
  netzachTricks,
  netzachCoins,
  netzachKeys,
  netzachSpikes,
  netzachEnemies,
  netzachTriggers,
  netzachLore,
  netzachExtra
);
