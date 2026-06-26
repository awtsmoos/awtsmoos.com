import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 4 stretches the garden into a run with intentional pauses. */
export const level04 = adventureMap({
  no: 4, name: 'Netzach River Run', difficulty: 'Easy', theme: 'river', hue: 120,
  description: 'A longer lane teaches pacing: run, stop for a Spark, climb, then engage.',
  idea: 'Introduce distance and tempo without adding extra enemies too quickly.',
  progression: ['long safe run', 'weapon pickup before danger', 'upper optional Spark', 'single guarded exit'],
  enemies: ['Kelipah Runner guards the final riverbank after the weapon lesson.'],
  powerups: ['Spark of Netzach is on the main route; hidden Spark is above the pause platform.'],
  weapons: ['River Staff placed before the enemy so players can test weapon confidence.'],
  secrets: ['Hidden Spark on the upper notch asks for a jump off the pause platform.'],
  rows: [
    'S   O       *     ',
    '======    ###     ',
    '       W       B  ',
    '   ##       ##    ',
    '          ##      ',
    '=================='
  ]
});
