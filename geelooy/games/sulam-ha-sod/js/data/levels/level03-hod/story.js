// B"H
import { P, G } from '../../levelPrimitives.js';

/**
 * Hod story and trigger law.
 *
 * The Awtsmoos makes the library argue in falling punctuation. The hidden shelf
 * appears only when the player reads slowly, and the final gate unlocks when the
 * argument has been answered with movement instead of panic.
 */
export const hodTriggers = [
  G(1100, 260, 100, 100, 'The library shifts a hidden shelf.', { platforms: [P(1370, 245, 100, 18)] }),
  G(1680, 300, 95, 110, 'The paragraph above you becomes falling punctuation.', {
    spikes: [
      { x: 1770, y: 122, w: 68, h: 22, warning: 0.6, duration: 1.08, fallSpeed: 360, safe: 90 },
      { x: 1850, y: 150, w: 70, h: 22, warning: 0.72, duration: 1.08, fallSpeed: 385, safe: 90 },
      { x: 1934, y: 178, w: 72, h: 22, warning: 0.84, duration: 1.08, fallSpeed: 410, safe: 90 }
    ]
  }),
  G(2450, 250, 100, 100, 'The argument ends. The gate unlocks.', { openExit: true })
];

export const hodLore = [
  'Hod should confuse, not overlap nonsense.',
  'Every hazard must be readable.',
  'The safe shelf is the one that does not flatter greed.'
];
