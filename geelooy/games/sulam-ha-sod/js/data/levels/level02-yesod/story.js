// B"H
import { P, G } from '../../levelPrimitives.js';

/**
 * Yesod story: the mirror warns before it bites.
 *
 * The Awtsmoos keeps reflection as a lesson in timing. No ceiling tooth falls
 * from nowhere; the player sees a message, sees the red warning, and has room
 * to choose patience instead of panic.
 */
export const yesodTriggers = [
  G(1060, 260, 100, 110, 'A mirror bridge appears ahead, not behind you.', { platforms: [P(1540, 250, 110, 18)] }),
  G(1500, 250, 110, 110, 'The reflected coin line calls down visible teeth.', {
    spikes: [
      { x: 1620, y: 110, w: 66, h: 22, warning: 1.15, duration: 1.0, fallSpeed: 220, safe: 150, showDormant: true },
      { x: 1710, y: 140, w: 68, h: 22, warning: 1.4, duration: 1.0, fallSpeed: 240, safe: 150, showDormant: true }
    ]
  }),
  G(2200, 190, 120, 115, 'The mirror accepts your clear climb.', { openExit: true })
];

export const yesodLore = [
  'Not every glowing floor remains loyal.',
  'Patience creates safe timing.',
  'A reflected coin must never demand a hidden jump.'
];
