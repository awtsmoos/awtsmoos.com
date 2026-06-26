import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 8 is a hand-staggered thinking tower. */
export const level08 = adventureMap({
  no: 8, name: 'Binah Terrace Tower', difficulty: 'Medium-', theme: 'temple', hue: 285,
  description: 'A terrace tower asks the player to read height before fighting.',
  idea: 'Introduce vertical planning: the obvious path and the reward path diverge.',
  progression: ['climb left terraces', 'cross toward the visible Spark', 'notice the weapon balcony', 'descend into one guarded landing'],
  enemies: ['Broken Vessel stands below the final descent to test controlled falling.'],
  powerups: ['Spark of Binah is high and obvious; hidden Spark is tucked under the first terrace.'],
  weapons: ['Insight Spear is on a balcony that requires skipping the direct route.'],
  secrets: ['Hidden Spark under the opening terrace rewards looking backward after climbing.'],
  rows: [
    'S        *         ',
    '====  ##           ',
    '        ##    O    ',
    '   ##        ### W ',
    '        ##         ',
    '            B      ',
    '=======    ========'
  ]
});
