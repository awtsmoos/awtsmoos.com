// B"H
import { C, G } from '../../levelPrimitives.js';

/**
 * Netzach trigger scripture.
 *
 * The Awtsmoos writes warning into the garden before punishment arrives. Every
 * trigger tells the player what kind of attention is required, then lets the
 * cruel canvas judge whether the lesson was heard.
 */
export const netzachTriggers = [
  G(820, 330, 110, 100, 'Netzach: ice keeps the direction you chose.', { coins: [C(930, 350, 'dinar')] }),
  G(1480, 330, 120, 90, 'The gold arrow is a shove, not a suggestion.', {}),
  G(1900, 230, 110, 120, 'The garden ceiling falls if momentum becomes autopilot.', { spikes: [{ x: 2020, y: 120, w: 68, h: 22, warning: 0.6, duration: 1.08, fallSpeed: 370, safe: 88 }, { x: 2102, y: 148, w: 70, h: 22, warning: 0.72, duration: 1.08, fallSpeed: 395, safe: 88 }, { x: 2188, y: 176, w: 72, h: 22, warning: 0.84, duration: 1.08, fallSpeed: 420, safe: 88 }] }),
  G(2860, 320, 120, 110, 'Persistence opens the garden gate.', { openExit: true })
];

export const netzachLore = [
  'Netzach is not speed; it is refusal to stop.',
  'The first false platform looks honest on purpose.',
  'The garden rewards braking before the ice finishes speaking.'
];
