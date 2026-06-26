import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 6 is the first honest gap lesson, placed by hand. */
export const level06 = adventureMap({
  no: 6, name: 'Gevurah Red Bridge', difficulty: 'Easy+', theme: 'ruins', hue: 8,
  description: 'A red judgment bridge teaches crossing gaps without panic.',
  idea: 'Introduce visible gaps with safe landings before combat pressure returns.',
  progression: ['collect Spark of Gevurah', 'cross two broken bridge teeth', 'drop for hidden Spark only if confident', 'fight the bridge guard'],
  enemies: ['Kelipah Guard waits after the second gap, never before the lesson is learned.'],
  powerups: ['Spark of Gevurah is before the bridge to build courage; hidden Spark is below the safe route.'],
  weapons: ['Judgment Rod is placed after the bridge guard as earned authority.'],
  secrets: ['Hidden Spark rests below the first gap, recoverable by using the lower bridge piece.'],
  rows: [
    'S  O              ',
    '=====    ##       ',
    '      ##      B   ',
    '   *       ##     ',
    '          ====  W ',
    '======      ======',
    '   =====          '
  ]
});
