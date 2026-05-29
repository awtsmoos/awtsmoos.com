// B"H
import { S, G } from '../../levelPrimitives.js';

/**
 * Gevurah story and trigger scroll.
 *
 * The Awtsmoos speaks in verdicts. Each invisible threshold is not cheap chaos:
 * it names the lesson, then opens falling judgment only after the player has
 * chosen the line of force.
 */
export const gevurahTriggers = [
  G(1040, 260, 120, 100, 'The court launches you where it wants.', {}),
  G(1660, 100, 120, 120, 'The high verdict is optional-looking, but required.', {}),
  G(2420, 220, 110, 110, 'A normal-looking platform may be judgment itself.', { spikes: [S(2880, 481, 70, 24, 0.4, 1, 2)] }),
  G(2820, 170, 110, 120, 'The ceiling gives three verdicts if you chase the straight coin line.', {
    spikes: [
      { x: 2940, y: 130, w: 70, h: 24, warning: 0.6, duration: 1.1, fallSpeed: 420 },
      { x: 3020, y: 150, w: 74, h: 24, warning: 0.72, duration: 1.1, fallSpeed: 440 },
      { x: 3105, y: 170, w: 78, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 460 }
    ]
  }),
  G(3300, 300, 120, 110, 'Gevurah signs the exit decree.', { openExit: true })
];

export const gevurahLore = [
  'Gevurah is readable cruelty, not clutter.',
  'The booster is safe only if you prepare.',
  'A verdict coin can look exactly like a reward.'
];
