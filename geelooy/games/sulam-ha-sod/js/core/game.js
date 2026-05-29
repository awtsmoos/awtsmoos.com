// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { SoundEffects } from '../systems/soundEffects.js';
import { ProgressionStore } from '../systems/progression.js';
import { buyLevelUnlock, buySkin, equipSkin } from '../systems/market.js';

const COIN_META = Object.freeze([['perutah', 'P'], ['dinar', 'D'], ['sela', 'S'], ['maneh', 'M']]);

/**
 * Game orchestrates chambers, persistence, shop, HUD, and banking.
 *
 * The Awtsmoos made the run-purse fragile: coins collected inside a level are
 * only candidates until the door is reached. The Game banks them with a time
 * bonus on completion, or forfeits them when the player returns to menu.
 */
export class Game {
  constructor({ input, renderer, hud, onProgress, onLevelComplete }) {
    this.input = input;
    this.renderer = renderer;
    this.hud = hud;
    this.onProgress = onProgress || (() => {});
    this.onLevelComplete = onLevelComplete || (() => {});
    this.sound = new SoundEffects();
    this.progress = new ProgressionStore();
    this.index = 0;
    this.running = false;
    this.world = this.createWorld(0);
    this.last = 0;
    this.hudCache = Object.create(null);
    this.walletNodes = Object.create(null);
    this.setupWalletPills();
    this.loop = this.loop.bind(this);
  }

  createWorld(index) { const world = new PhysicsWorld(LEVELS[index]); this.progress.applyToWorld(world); return world; }
  start() { if (this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  pause() { this.running = false; }

  newGame(index = Math.min(this.progress.state.unlocked - 1, this.index || 0)) {
    this.index = Math.max(0, Math.min(LEVELS.length - 1, index));
    this.world = this.createWorld(this.index);
    this.resetHudCache();
    this.start();
    this.onProgress(this);
  }

  chooseLevel(index) { if (index + 1 > this.progress.state.unlocked) return false; this.newGame(index); return true; }
  buyOrEquipSkin(id) { const result = buySkin(this.progress.state.market, this.progress.state.currency, id); this.afterMarket(result); return result; }
  equipSkin(id) { const result = equipSkin(this.progress.state.market, id); this.afterMarket(result); return result; }
  buyNextLevel() { const result = buyLevelUnlock(this.progress.state, LEVELS.length); this.afterMarket(result); return result; }

  afterMarket(result) {
    this.progress.save();
    this.progress.applyToWorld(this.world);
    if (result.ok) this.sound.play('coin');
    this.resetHudCache();
    this.onProgress(this);
  }

  loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.033, (t - this.last) / 1000 || 0);
    this.last = t;
    const input = this.input.read();
    if (input.ok || input.jump) this.sound.unlock();
    this.world.visibleCameraX = this.renderer.camera?.x ?? this.world.visibleCameraX ?? 0;
    this.world.visibleCameraY = this.renderer.camera?.y ?? this.world.visibleCameraY ?? 0;
    if (this.world.deathPause) this.handleDeathPause(input, dt);
    else if (this.world.step(input, dt) === 'next') this.advance();
    this.playWorldSounds();
    this.renderer.draw(this.world);
    this.paintHud();
    requestAnimationFrame(this.loop);
  }

  handleDeathPause(input, dt) { this.world.step(input, dt); if (input.ok && this.world.continueAfterDeath()) this.playWorldSounds(); }
  playWorldSounds() { for (const name of this.world.drainSoundEvents?.() || []) this.sound.play(name); }

  advance() {
    const completed = this.index;
    const reward = this.bankCompletionReward(this.world);
    this.progress.syncFromWorld(this.world);
    this.progress.unlock(completed + 1);
    this.index = Math.min(LEVELS.length - 1, this.index + 1);
    this.world = this.createWorld(this.index);
    this.world.message = `A higher chamber opens. Banked ${reward.banked} Shefa + ${reward.bonus} speed bonus.`;
    this.sound.play('continue');
    this.resetHudCache();
    this.pause();
    this.onProgress(this);
    this.onLevelComplete(completed, this.index, reward);
  }

  /** @param {PhysicsWorld} world completed world @returns {object} reward summary */
  bankCompletionReward(world) {
    const run = world.runCurrency || {};
    for (const key of ['perutah', 'dinar', 'sela', 'maneh']) world.currency[key] = (world.currency[key] || 0) + (run[key] || 0);
    const banked = run.shefa || 0;
    const bonus = this.timeBonus(world);
    world.currency.shefa = (world.currency.shefa || 0) + banked + bonus;
    world.currency.chain = 0;
    world.currency.bestChain = Math.max(world.currency.bestChain || 0, run.bestChain || 0);
    world.market.message = `Completed in ${this.formatTime(world.levelElapsed)}. Banked ${banked}, speed bonus ${bonus}.`;
    return { banked, bonus, elapsed: world.levelElapsed, total: banked + bonus };
  }

  /** @param {PhysicsWorld} world completed world @returns {number} speed reward */
  timeBonus(world) {
    const difficulty = world.performance?.difficulty || 1;
    const target = Math.max(35, 95 + difficulty * 7 + world.realCoinTotal * 1.5);
    const ratio = Math.max(0, Math.min(1, (target - world.levelElapsed) / target));
    return Math.round((15 + difficulty * 4 + world.realCoinTotal) * ratio + Math.max(0, world.realCoinTotal - world.levelElapsed / 10));
  }

  /** Forfeits current run and returns to main menu without banking. */
  exitToMenu() {
    const lost = this.world?.runCurrency?.shefa || 0;
    this.pause();
    this.world = this.createWorld(this.index);
    this.world.message = lost ? `Returned to menu. Lost ${lost} unbanked Shefa.` : 'Returned to menu.';
    this.resetHudCache();
    this.onProgress(this);
    return { lost };
  }

  paintHud() {
    const w = this.world;
    const runProgress = Math.max(0, Math.min(100, Math.round((w.player.x / Math.max(1, w.width - w.player.w)) * 100)));
    const collected = w.realCoinsCollected || 0;
    const total = Math.max(0, w.realCoinTotal || 0);
    const coinPct = total ? Math.round((collected / total) * 100) : 100;
    const hasKey = w.keyCount > 0;
    const open = Boolean(w.canExit?.());
    this.setText('level', this.hud.level, ` ${w.level.name}`);
    this.setText('difficulty', this.hud.difficulty, `D${w.performance.difficulty}`);
    this.setStyle('progressWidth', this.hud.progressFill.style, 'width', `${runProgress}%`);
    this.setText('progressText', this.hud.progressText, `${runProgress}%`);
    this.setStyle('coinPct', this.hud.coinRing.style, '--coinPct', String(coinPct));
    this.setText('coinText', this.hud.coinText, `${collected}/${total}`);
    this.setText('stats', this.hud.stats, `${this.formatTime(w.levelElapsed)} · Run +${w.runCurrency?.shefa || 0}${open ? ' · Door open' : ''}`);
    this.paintKeyBadge(hasKey);
    this.paintShefaPills(w.currency || {});
  }

  paintKeyBadge(hasKey) {
    if (this.hudCache.hasKey !== hasKey) {
      this.hud.keyBadge.classList.toggle('locked', !hasKey);
      this.hud.keyBadge.classList.toggle('unlocked', hasKey);
      this.hudCache.hasKey = hasKey;
    }
    this.setText('keyText', this.hud.keyBadge.querySelector('span'), hasKey ? 'Key' : 'No key');
  }

  setupWalletPills() {
    const parts = [...COIN_META, ['shefa', 'ש']];
    this.hud.shefaPills.textContent = '';
    for (const [key, label] of parts) {
      const span = document.createElement('span');
      span.className = `shefaCoin ${key}`;
      span.title = key === 'shefa' ? 'Shefa' : key;
      const icon = document.createElement('i');
      icon.textContent = label;
      const value = document.createElement('b');
      value.textContent = '0';
      span.append(icon, value);
      this.hud.shefaPills.append(span);
      this.walletNodes[key] = value;
    }
  }

  paintShefaPills(currency) {
    for (const key of ['perutah', 'dinar', 'sela', 'maneh', 'shefa']) {
      const value = String(currency[key] || 0);
      if (this.hudCache[`wallet:${key}`] === value) continue;
      this.walletNodes[key].textContent = value;
      this.hudCache[`wallet:${key}`] = value;
    }
  }

  formatTime(seconds = 0) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(total / 60)).padStart(2, '0');
    const secs = String(total % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  setText(key, node, value) { if (this.hudCache[key] !== value) { node.textContent = value; this.hudCache[key] = value; } }
  setStyle(key, style, prop, value) { if (this.hudCache[key] !== value) { style.setProperty(prop, value); this.hudCache[key] = value; } }
  resetHudCache() { this.hudCache = Object.create(null); }
}
