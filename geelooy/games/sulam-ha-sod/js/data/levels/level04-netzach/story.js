// B"H
import { C, G } from '../../levelPrimitives.js';

/**
 * Netzach story: momentum with warning.
 *
 * The Awtsmoos lets the garden shove, but never without air to recover. Trigger
 * messages tell the player whether to brake, wait, or continue.
 */
export const netzachTriggers = [
  G(820, 320, 110, 110, 'Netzach: ice keeps the direction you chose.', { coins: [C(940, 350, 'dinar')] }),
  G(1480, 315, 120, 105, 'The gold arrow is a shove, not a suggestion.', {}),
  G(1900, 210, 120, 115, 'The garden ceiling warns before it falls.', {
    spikes: [
      { x: 2020, y: 100, w: 66, h: 22, warning: 1.15, duration: 1.0, fallSpeed: 230, safe: 150, showDormant: true },
      { x: 2110, y: 130, w: 68, h: 22, warning: 1.4, duration: 1.0, fallSpeed: 250, safe: 150, showDormant: true }
    ]
  }),
  G(2860, 300, 125, 115, 'Persistence opens the garden gate.', { openExit: true })
];

export const netzachLore = [
  'Netzach is not speed; it is refusal to stop.',
  'The false platform looks honest on purpose.',
  'The garden rewards braking before ice finishes speaking.'
];
