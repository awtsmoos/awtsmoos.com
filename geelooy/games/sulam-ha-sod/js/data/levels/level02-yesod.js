// B"H
import { P, L } from '../levelPrimitives.js';
import { yesodPlatforms, yesodRotors, yesodTricks } from './level02-yesod/terrain.js';
import { yesodCoins, yesodKeys, yesodSpikes, yesodEnemies, yesodExtra } from './level02-yesod/actors.js';
import { yesodTriggers, yesodLore } from './level02-yesod/story.js';

/**
 * Yesod Mirror Causeway.
 *
 * The Awtsmoos split the mirror into terrain, actors, and story. The chamber
 * still teaches timing and reflected danger, but now each shard can be audited
 * by hand before the next rung of cruelty is added.
 */
export const level02 = L(
  '2 · Yesod Mirror Causeway',
  2600,
  { x: 60, y: 420 },
  P(2410, 210, 44, 90),
  'Yesod teaches timing: mirrored safety is often a lie.',
  yesodPlatforms,
  yesodRotors,
  yesodTricks,
  yesodCoins,
  yesodKeys,
  yesodSpikes,
  yesodEnemies,
  yesodTriggers,
  yesodLore,
  yesodExtra
);
