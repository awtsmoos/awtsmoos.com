import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 2 is hand-built vertical rhythm, not a shifted copy. */
export const level02 = adventureMap({
  no: 2, name: 'Yesod Moon Stair', difficulty: 'Easy', theme: 'night', hue: 210,
  description: 'Moonlit steps teach measured jumps, with a weapon visible above the patrol.',
  idea: 'Introduce vertical climbing through offset single-purpose platforms.',
  progression: ['short hop', 'middle ledge recovery', 'upper Spark detour', 'drop toward the Kelipah Guard'],
  enemies: ['Kelipah Guard waits below the final descent to test landing control.'],
  powerups: ['Spark of Yesod sits on the upper step to reward deliberate climbing.'],
  weapons: ['Moon Rod is visible early but requires taking the higher route.'],
  secrets: ['Hidden Spark tucked left of the final descent; reachable only by slowing down.'],
  rows: [
    'S        O       ',
    '====          W  ',
    '     ##          ',
    '          ##     ',
    '   *          B  ',
    '=======    ======',
    '     =========   '
  ]
});
