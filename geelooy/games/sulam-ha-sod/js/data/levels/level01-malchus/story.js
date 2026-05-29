// B"H
import { C, G } from '../../levelPrimitives.js';

/**
 * Chapter 9: The Awtsmoos made the first ceiling confess before falling.
 *
 * The first triggered spike curtain used to descend while the player was already
 * committed upward. Now the warning is slow, loud in text, and staggered; the
 * player can stop, retreat, or dodge through the open lane before teeth become
 * solid judgment.
 */
export const malchusTriggers = [
  G(650, 376, 100, 104, 'Dust remembers every careless jump.', { coins: [C(755, 350)] }),
  G(1320, 226, 130, 120, 'Red ceiling marks appear first. Wait, then pass.', {
    spikes: [
      { x: 1408, y: 92, w: 56, h: 22, warning: 1.25, duration: 0.95, fallSpeed: 180, safe: 170, showDormant: true },
      { x: 1496, y: 126, w: 58, h: 22, warning: 1.45, duration: 0.95, fallSpeed: 200, safe: 170, showDormant: true },
      { x: 1590, y: 160, w: 60, h: 22, warning: 1.65, duration: 0.95, fallSpeed: 220, safe: 170, showDormant: true }
    ]
  }),
  G(1860, 274, 130, 130, 'The gate begins listening.', { openExit: true })
];

export const malchusLore = [
  'The first rung must be fair enough to teach, not crush.',
  'The first spike must show its red breath before it bites.',
  'The first lie is readable; the Awtsmoos wants learning, not guessing.'
];
