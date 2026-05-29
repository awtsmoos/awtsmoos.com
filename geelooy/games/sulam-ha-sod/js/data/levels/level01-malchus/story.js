// B"H
import { C, G } from '../../levelPrimitives.js';

/**
 * Malchus story: warning before judgment.
 *
 * The Awtsmoos writes the first law kindly: every falling tooth shows red first,
 * every message tells the player what is happening, and the gate opens from the
 * obvious final approach rather than a hidden death lesson.
 */
export const malchusTriggers = [
  G(640, 360, 100, 110, 'Dust remembers every careful jump.', { coins: [C(725, 405)] }),
  G(1280, 250, 120, 110, 'Red ceiling marks appear first. Wait, then pass.', {
    spikes: [
      { x: 1420, y: 120, w: 56, h: 22, warning: 1.2, duration: 0.95, fallSpeed: 190, safe: 160, showDormant: true },
      { x: 1510, y: 150, w: 58, h: 22, warning: 1.45, duration: 0.95, fallSpeed: 210, safe: 160, showDormant: true }
    ]
  }),
  G(1840, 275, 130, 120, 'The first gate begins listening.', { openExit: true })
];

export const malchusLore = [
  'The first rung must teach, not crush.',
  'The first spike must show its red breath before it bites.',
  'The first sky path is optional and readable from below.'
];
