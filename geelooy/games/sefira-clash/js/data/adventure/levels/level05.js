import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 5 combines the first lessons into a small handcrafted test. */
export const level05 = adventureMap({
  no: 5, name: 'Tiferes Orchard Trial', difficulty: 'Easy+', theme: 'orchard', hue: 45,
  description: 'A balanced orchard mixing safe hops, one stomp target, weapon timing, and a secret alcove.',
  idea: 'First mastery check: movement, vertical choice, combat, reward, and hidden content together.',
  progression: ['collect visible Spark', 'hop staggered orchard stones', 'choose weapon or stomp route', 'clear two Kelipah vessels'],
  enemies: ['Kelipah Walker on the central lane; Broken Vessel near the exit platform.'],
  powerups: ['Spark of Tiferes in the open; hidden Spark in a low alcove under the weapon route.'],
  weapons: ['Balanced Branch sits between enemy routes so timing matters.'],
  secrets: ['Low alcove hidden Spark requires dropping below the obvious combat line.'],
  rows: [
    'S  O       B      ',
    '=====   ##        ',
    '     ##     W     ',
    '  *       ====    ',
    '        ##     B  ',
    '====        ===== ',
    '   ==============='
  ]
});
