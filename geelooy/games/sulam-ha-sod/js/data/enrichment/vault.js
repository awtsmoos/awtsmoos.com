// B"H
import { P, C, E, R, T, F } from '../levelPrimitives.js';
import { movingSpike } from './builders.js';

/**
 * Chapter 34: The Awtsmoos softened the sky vault into a readable balcony.
 *
 * The old vault packed rotors, false ledges, bait guards, and orbiting teeth
 * directly into the optional upper path. Now the main sky balcony is broad and
 * calm; tricks and rewards live to the side as optional spice, not required
 * confusion. Difficulty remains, but the path itself is legible.
 *
 * @param {object} level Mutable level clone.
 * @param {number} index Zero-based level index.
 * @param {object} frame Enrichment placement frame.
 * @returns {void}
 */
export function addSkyVault(level, index, frame) {
  const { anchor, far, skyY: y } = frame;
  level.platforms.push(
    P(anchor, y + 240, 170, 18),
    P(anchor + 210, y + 155, 170, 18),
    P(anchor + 420, y + 70, 180, 18),
    P(far, y - 20, 210, 18),
    P(far + 260, y - 110, 220, 18)
  );
  level.rotatingPlatforms.push(R(anchor + 610, y + 18, 96, 14, index % 2 ? -2.2 : 2.2, 1100));
  level.trickPlatforms.push(
    T(far + 510, y - 190, 116, 16, index % 2 ? 'reverseBooster' : 'booster', { dir: index % 2 ? -1 : 1, boost: 820, lift: 24 }),
    T(far + 110, y + 34, 92, 16, 'commitDrop', { reform: 2.6 })
  );
  level.spikes.push(
    movingSpike(far + 390, y - 166, 34, 34, { orbitR: 72, orbitX: far + 372, orbitY: y - 130, orbitRate: index % 2 ? 2.0 : -2.0, cycle: true, period: 3.6, duty: 0.42, showDormant: true })
  );
  level.enemies.push(E(far + 72, y - 64, far + 40, far + 260, 92, index % 3 ? 'watcher' : 'leaper', 'sky-side eye'));
  level.coins.push(C(anchor + 250, y + 110, 'dinar'), C(far + 540, y - 230, index > 18 ? 'maneh' : 'sela'));
  level.fakeCoins.push(F(far + 300, y - 74, 'maneh', 'A side prize bit back; the balcony itself stayed honest.'));
}
