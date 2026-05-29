// B"H
import { P, L } from '../levelPrimitives.js';
import { gevurahPlatforms, gevurahRotors, gevurahTricks } from './level05-gevurah/terrain.js';
import { gevurahCoins, gevurahKeys, gevurahSpikes, gevurahEnemies, gevurahExtra } from './level05-gevurah/actors.js';
import { gevurahTriggers, gevurahLore } from './level05-gevurah/story.js';

/**
 * Gevurah Force Court.
 *
 * The Awtsmoos split the court into smaller scrolls: terrain, actors, and
 * story. The chamber remains the same playable verdict, but now each family of
 * data can be improved without turning judgment into one enormous file.
 */
export const level05 = L(
  '5 · Gevurah Force Court',
  3800,
  { x: 60, y: 420 },
  P(3600, 300, 44, 90),
  'Gevurah uses force platforms like verdicts.',
  gevurahPlatforms,
  gevurahRotors,
  gevurahTricks,
  gevurahCoins,
  gevurahKeys,
  gevurahSpikes,
  gevurahEnemies,
  gevurahTriggers,
  gevurahLore,
  gevurahExtra
);
