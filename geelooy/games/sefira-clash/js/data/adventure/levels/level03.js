import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 3 is a deliberate two-lane mirror lesson with asymmetric rewards. */
export const level03 = adventureMap({
  no: 3, name: 'Hod Mirror Lanes', difficulty: 'Easy', theme: 'mirror', hue: 260,
  description: 'Two separated lanes ask the player to choose approach, retreat, and re-entry.',
  idea: 'Teach that similar-looking lanes can carry different tactical meaning.',
  progression: ['choose high safe lane or low Spark lane', 'bait the first Shadow Spark', 'cross back for the weapon', 'finish the lower patrol'],
  enemies: ['Shadow Spark on the high lane; Kelipah Walker on the lower lane.'],
  powerups: ['Spark of Hod is exposed low; hidden Spark is behind the first retreat pocket.'],
  weapons: ['Mirror Blade bridges the two lanes so the player learns repositioning.'],
  secrets: ['Hidden Spark behind the left retreat pocket rewards reversing direction.'],
  rows: [
    'S     B      W   ',
    '====      =====  ',
    '   ##            ',
    ' *      O   ##   ',
    '      ====     B ',
    '================='
  ]
});
