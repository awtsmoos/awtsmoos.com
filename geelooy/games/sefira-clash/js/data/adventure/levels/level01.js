import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 1 is a hand-placed first breath: walk, hop, Spark, then patrol. */
export const level01 = adventureMap({
  no: 1, name: 'Malchus Gate Garden', difficulty: 'Easy', theme: 'garden', hue: 22,
  description: 'A calm first garden: one safe Spark, one bridge hop, one Kelipah Walker.',
  idea: 'Teach horizontal movement before danger; the only enemy waits after the first jump.',
  progression: ['walk right', 'collect Spark of Malchus', 'hop the low garden ledge', 'stomp or strike one Kelipah Walker'],
  enemies: ['Kelipah Walker placed past the bridge so combat never interrupts first movement.'],
  powerups: ['Spark of Malchus sits in the safe opening lane as a visible reward.'],
  weapons: ['Training Staff appears after the enemy as a reward, not a crutch.'],
  secrets: ['A hidden Spark rests under the second ledge for players who drop and recover.'],
  rows: [
    'S   O            ',
    '=====     ##     ',
    '        ##   B   ',
    '   *             ',
    '      ###     W  ',
    '================='
  ]
});
