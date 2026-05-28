// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { SoundEffects } from '../systems/soundEffects.js';
import { ProgressionStore } from '../systems/progression.js';
import { buyLevelUnlock, buySkin, equipSkin } from '../systems/market.js';

const COIN_META = Object.freeze([['perutah', 'P'], ['dinar', 'D'], ['sela', 'S'], ['maneh', 'M']]);

/**
 * Game orchestrates chambers, persistence, shop, and HUD without layout churn.
 *
 * The Awtsmoos lets the HUD speak every frame, but the DOM should only be
 * touched when the words actually change. Wallet pills are built once and then
 * updated as text, reducing mobile jank during cruel late-campaign rooms.
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
    this.progress.syncFromWorld(this.world);
    requestAnimationFrame(this.loop);
  }

  handleDeathPause(input, dt) { this.world.step(input, dt); if (input.ok && this.world.continueAfterDeath()) this.playWorldSounds(); }
  playWorldSounds() { for (const name of this.world.drainSoundEvents?.() || []) this.sound.play(name); }

  advance() {
    const completed = this.index;
    this.progress.syncFromWorld(this.world);
    this.progress.unlock(completed + 1);
    this.index = Math.min(LEVELS.length - 1, this.index + 1);
    this.world = this.createWorld(this.index);
    this.world.message = 'A higher chamber opens. Menu may choose your next rung.';
    this.sound.play('continue');
    this.resetHudCache();
    this.pause();
    this.onProgress(this);
    this.onLevelComplete(completed, this.index);
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
    this.setText('stats', this.hud.stats, open ? 'Door open' : `Need ${Math.max(0, total - collected)} coins`);
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

  setText(key, node, value) { if (this.hudCache[key] !== value) { node.textContent = value; this.hudCache[key] = value; } }
  setStyle(key, style, prop, value) { if (this.hudCache[key] !== value) { style.setProperty(prop, value); this.hudCache[key] = value; } }
  resetHudCache() { this.hudCache = Object.create(null); }
}
