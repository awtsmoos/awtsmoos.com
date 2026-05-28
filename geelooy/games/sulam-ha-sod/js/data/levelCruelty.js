// B"H
import { P, C, S, E, R, T, G, F } from './levelPrimitives.js';

/**
 * Optional high-sky side-adventure grafts for Sulam HaSod.
 *
 * The Awtsmoos reviews every chamber and adds one more whisper: a side vault in
 * the sky-band, a second fake reward, a watching enemy, and, only when spacing
 * allows, falling iron. This improves all existing levels without touching the
 * authored main path or burying coins inside hazards.
 */
export function enrichLevel(level, index) {
  const clone = structuredClone(level);
  const anchor = Math.max(760, Math.min((level.width || 2600) - 1800, 1180 + index * 170));
  const y = -270 - (index % 5) * 22;
  const far = anchor + 780;
  const triggerX = safeTriggerX(clone, far + 80);

  addSkyVault(clone, index, anchor, far, y);
  addSoftSurprises(clone, index, anchor, far, y);
  if (triggerX !== null) clone.triggers.push(fallingIronTrigger(triggerX, y));
  addWisdom(clone);
  return clone;
}

/** @param {object} level mutable clone @param {number} index level index @param {number} anchor x @param {number} far far x @param {number} y sky y */
function addSkyVault(level, index, anchor, far, y) {
  level.platforms.push(
    P(anchor, y + 240, 118, 18),
    P(anchor + 210, y + 164, 112, 18),
    P(anchor + 450, y + 88, 126, 18),
    P(far, y + 18, 150, 18)
  );
  level.rotatingPlatforms.push(
    R(anchor + 128, y + 202, 84, 14, index % 2 ? 4.1 : -4.1, 780 + index * 20),
    R(anchor + 590, y + 54, 100, 14, index % 2 ? -5.2 : 5.2, 900 + index * 24)
  );
  level.trickPlatforms.push(
    T(anchor + 330, y + 126, 92, 16, 'falseSpike'),
    T(far + 210, y - 24, 106, 16, 'commitDrop', { reform: 2.2 }),
    T(far + 410, y - 92, 116, 16, index % 2 ? 'reverseBooster' : 'booster', { dir: index % 2 ? -1 : 1, boost: 980 + index * 14, lift: 28 })
  );
}

/** @param {object} level mutable clone @param {number} index level index @param {number} anchor x @param {number} far far x @param {number} y sky y */
function addSoftSurprises(level, index, anchor, far, y) {
  level.spikes.push(
    S(anchor + 54, y + 280, 88, 24, 1.35 + index * 0.03, 1, 2.3),
    S(far + 34, y + 58, 78, 22, 1.8, 0.9, 2.1)
  );
  level.enemies.push(
    E(far + 92, y - 34, far + 40, far + 280, 128, index % 3 ? 'watcher' : 'leaper', 'sky-side eye'),
    E(far + 390, y - 116, far + 330, far + 540, 120, 'baitGuard', 'saw shepherd')
  );
  level.coins.push(
    C(anchor + 238, y + 126, 'dinar'),
    C(far + 454, y - 136, index > 18 ? 'maneh' : 'sela')
  );
  level.fakeCoins.push(
    F(far + 292, y - 64, 'maneh', 'The sky shortcut unfolded into teeth.'),
    F(anchor + 412, y + 52, 'dinar', 'The upper side coin was only a painted tooth.')
  );
}

/** @param {number} x trigger x @param {number} y sky y @returns {object} trigger */
function fallingIronTrigger(x, y) {
  return G(x, y - 142, 170, 118,
    'The ceiling heard your ambition and answered with descending iron.',
    { spikes: [
      { x: x - 26, y: y - 250, w: 70, h: 24, warning: 0.45, duration: 1.1, fallSpeed: 470 },
      { x: x + 66, y: y - 208, w: 76, h: 24, warning: 0.6, duration: 1.1, fallSpeed: 510 },
      { x: x + 168, y: y - 164, w: 84, h: 24, warning: 0.78, duration: 1.15, fallSpeed: 540 }
    ] }
  );
}

/** @param {object} level mutable clone */
function addWisdom(level) {
  level.wisdom = [
    ...(level.wisdom || []),
    'Some upper paths are treasure vaults. Some are vertical lies.',
    'When a platform waits too calmly before your jump, distrust it.',
    'The side routes contain rotating saw prayers and falling iron letters.'
  ];
}

/** @param {object} level cloned level vessel @param {number} preferred preferred coordinate @returns {number|null} */
function safeTriggerX(level, preferred) {
  const taken = (level.triggers || []).map(trigger => trigger.x).sort((a, b) => a - b);
  const min = 640;
  const max = Math.max(min, (level.width || 3000) - 260);
  const candidates = [];
  for (let offset = 0; offset < 2800; offset += 90) candidates.push(preferred + offset, preferred - offset);
  candidates.push(max, min, Math.floor((min + max) / 2));
  for (const raw of candidates) {
    const x = Math.max(min, Math.min(max, raw));
    if (taken.every(other => Math.abs(other - x) >= 280)) return x;
  }
  return null;
}
