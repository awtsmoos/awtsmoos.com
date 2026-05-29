// B"H
import { P, G } from '../../levelPrimitives.js';

/**
 * Yesod story and trigger law.
 *
 * The Awtsmoos makes reflection into a sentence: the shelf fades when rushed,
 * the coin-line calls down teeth, and the mirror accepts only a learned climb.
 */
export const yesodTriggers = [
  G(1110, 250, 80, 100, 'A bridge fades when rushed.', { platforms: [P(1380, 250, 90, 18)] }),
  G(1510, 270, 95, 100, 'The reflected coin line calls down teeth.', {
    spikes: [
      { x: 1605, y: 120, w: 68, h: 22, warning: 0.6, duration: 1.05, fallSpeed: 350, safe: 80 },
      { x: 1685, y: 148, w: 70, h: 22, warning: 0.72, duration: 1.05, fallSpeed: 375, safe: 80 },
      { x: 1768, y: 176, w: 72, h: 22, warning: 0.84, duration: 1.05, fallSpeed: 400, safe: 80 }
    ]
  }),
  G(2200, 220, 100, 100, 'The mirror accepts your climb.', { openExit: true })
];

export const yesodLore = [
  'Not every glowing floor remains loyal.',
  'Patience creates safe timing.',
  'A real-looking coin can be the mirror wearing a blade.'
];
