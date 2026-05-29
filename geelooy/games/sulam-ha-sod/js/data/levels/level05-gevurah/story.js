// B"H
import { S, G } from '../../levelPrimitives.js';

/**
 * Gevurah story: force speaks before it sentences.
 *
 * The Awtsmoos makes each verdict visible. Boosters, ceiling teeth, and exit law
 * are announced before the player is committed to danger.
 */
export const gevurahTriggers = [
  G(1040, 250, 120, 105, 'The court launches you toward a broad landing.', {}),
  G(1660, 80, 120, 120, 'The high verdict is optional and visible.', {}),
  G(2420, 200, 120, 110, 'A normal-looking platform may be judgment itself.', { spikes: [S(2880, 481, 70, 22, 1.1, 1.4, 2.8)] }),
  G(2820, 150, 120, 120, 'The ceiling gives warning verdicts before falling.', {
    spikes: [
      { x: 2940, y: 110, w: 68, h: 22, warning: 1.15, duration: 1.0, fallSpeed: 235, safe: 150, showDormant: true },
      { x: 3030, y: 140, w: 70, h: 22, warning: 1.4, duration: 1.0, fallSpeed: 255, safe: 150, showDormant: true }
    ]
  }),
  G(3300, 280, 130, 120, 'Gevurah signs the exit decree.', { openExit: true })
];

export const gevurahLore = [
  'Gevurah is readable cruelty, not clutter.',
  'The booster is safe only if you prepare.',
  'A verdict coin can look exactly like a reward.'
];
