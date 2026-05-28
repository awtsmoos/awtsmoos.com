// B"H
import { equippedSkin } from './market.js';

const KEY = 'sulamHaSodProgress.v2';

/**
 * ProgressionStore keeps the ladder's memory inside the browser.
 *
 * The Awtsmoos remembers ascent without pretending the file system is the soul:
 * unlocked chambers, Shefa, purchased skins, and the equipped garment live in
 * localStorage. If storage is blocked, the game still runs with a fresh vessel.
 */
export class ProgressionStore {
  constructor() { this.state = this.load(); }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? normalize(JSON.parse(raw)) : freshState();
    } catch {
      return freshState();
    }
  }

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
  }

  unlock(index) {
    this.state.unlocked = Math.max(this.state.unlocked || 1, index + 1);
    this.save();
  }

  syncFromWorld(world) {
    this.state.currency = { ...world.currency };
    this.state.market = { ...world.market };
    this.save();
  }

  applyToWorld(world) {
    world.currency = { ...world.currency, ...(this.state.currency || {}) };
    world.market = { ...world.market, ...(this.state.market || {}) };
    world.player.skin = equippedSkin(world.market);
    world.score = world.currency.shefa || 0;
  }
}

function freshState() {
  return {
    unlocked: 1,
    currency: { perutah: 0, dinar: 0, sela: 0, maneh: 0, shefa: 0, chain: 0, bestChain: 0 },
    market: { owned: ['plain'], equipped: 'plain', open: false, message: 'Choose a chamber or visit the shop.' }
  };
}

function normalize(state) {
  const fresh = freshState();
  return {
    unlocked: Math.max(1, Number(state.unlocked || 1)),
    currency: { ...fresh.currency, ...(state.currency || {}) },
    market: { ...fresh.market, ...(state.market || {}) }
  };
}
