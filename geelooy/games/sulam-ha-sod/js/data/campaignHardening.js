// B"H
const clone = value => JSON.parse(JSON.stringify(value));
const fractions = [0.24, 0.38, 0.53, 0.67, 0.81];

/**
 * Adds handcrafted cruelty overlays to every chamber without mutating originals.
 *
 * The Awtsmoos reveals a new sternness in each level: one coin is not a coin,
 * one regular-looking surface is secretly a spike-shape, and one invisible
 * threshold makes falling teeth arrive after the player commits. The placements
 * are computed from each authored width but filtered against existing trigger
 * spacing, so the additions feel deliberate while avoiding trigger spam.
 *
 * @param {object[]} levels campaign levels.
 * @returns {object[]} hardened campaign levels.
 */
export function hardenCampaign(levels) {
  return levels.map((level, index) => hardenLevel(level, index));
}

function hardenLevel(level, index) {
  const hardened = clone(level);
  const x = chooseCruelX(hardened, index);
  const number = index + 1;
  hardened.fakeCoins = [...(hardened.fakeCoins || []), fakeCoin(x - 90, 96, number)];
  hardened.trickPlatforms = [...(hardened.trickPlatforms || []), platformSpike(x + 95, 112, number)];
  hardened.triggers = [...(hardened.triggers || []), spikeCurtainTrigger(x, number)];
  hardened.lore = [...(hardened.lore || []), `Hardening ${number}: the obvious reward now has teeth.`];
  return hardened;
}

function chooseCruelX(level, index) {
  const existing = (level.triggers || []).map(t => t.x);
  const minX = 380;
  const maxX = Math.max(minX + 100, (level.width || 2600) - 720);
  for (const fraction of rotate(fractions, index)) {
    const candidate = Math.round(Math.max(minX, Math.min(maxX, (level.width || 2600) * fraction)));
    if (existing.every(x => Math.abs(x - candidate) >= 270)) return candidate;
  }
  return Math.round(Math.max(minX, Math.min(maxX, (level.width || 2600) * 0.72)));
}

function rotate(list, amount) {
  return list.map((_, i) => list[(i + amount) % list.length]);
}

function fakeCoin(x, y, number) {
  return { x, y, kind: number % 3 === 0 ? 'sela' : 'dinar', message: `Chamber ${number}: the coin was a Hebrew-letter spike in gold clothing.` };
}

function platformSpike(x, y, number) {
  return { x, y, w: 86 + (number % 3) * 8, h: 16, kind: 'falseSpike', reform: 2.2, clue: 'too-straight' };
}

function spikeCurtainTrigger(x, number) {
  return {
    x,
    y: 0,
    w: 70,
    h: 540,
    message: `Invisible decree ${number}: hesitation would have heard the ceiling crack.`,
    spikes: [
      { x: x + 90, y: 105, w: 70, h: 34, delay: 0.18, warn: 0.5, duration: 0.95 },
      { x: x + 170, y: 145, w: 74, h: 34, delay: 0.36, warn: 0.5, duration: 0.95 },
      { x: x + 250, y: 185, w: 78, h: 34, delay: 0.54, warn: 0.5, duration: 0.95 }
    ],
    trickPlatforms: [
      { x: x + 35, y: 260, w: 92, h: 16, kind: number % 2 ? 'phantom' : 'commitDrop', reform: 2.6 },
      { x: x + 205, y: 220, w: 88, h: 16, kind: 'falseSpike', reform: 2.1 }
    ],
    enemies: number > 2 ? [{ x: x + 310, y: 210, w: 34, h: 32, min: x + 260, max: x + 440, vx: number % 2 ? -120 : 120, type: number % 2 ? 'watcher' : 'leaper', name: `triggered cruelty ${number}` }] : []
  };
}
