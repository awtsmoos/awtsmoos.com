// B"H
import { P, G } from '../../levelPrimitives.js';

/**
 * Hod story: the argument moves in visible steps.
 *
 * The Awtsmoos lets the library shift, but not behind the player's back. Every
 * new shelf appears ahead, and every falling punctuation mark warns before it
 * becomes a hazard.
 */
export const hodTriggers = [
  G(1080, 245, 110, 110, 'The library shifts a visible shelf forward.', { platforms: [P(1515, 235, 110, 18)] }),
  G(1660, 245, 120, 115, 'The paragraph above becomes warning punctuation.', {
    spikes: [
      { x: 1780, y: 110, w: 66, h: 22, warning: 1.15, duration: 1.0, fallSpeed: 225, safe: 150, showDormant: true },
      { x: 1870, y: 140, w: 68, h: 22, warning: 1.4, duration: 1.0, fallSpeed: 245, safe: 150, showDormant: true }
    ]
  }),
  G(2500, 220, 125, 115, 'The argument ends. The gate unlocks.', { openExit: true })
];

export const hodLore = [
  'Hod should confuse the eye, not trap the body.',
  'Every hazard must be readable.',
  'The safe shelf is the one that does not flatter greed.'
];
