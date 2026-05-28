// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { SoundEffects } from '../systems/soundEffects.js';
import { ProgressionStore } from '../systems/progression.js';
import { buyLevelUnlock, buySkin, equipSkin } from '../systems/market.js';

const COIN_META = Object.freeze([
  ['perutah', 'P'],
  ['dinar', 'D'],
  ['sela', 'S'],
  ['maneh', 'M']
]);

/**
 * Game orchestrates chambers, persistence, shop, and level unlocks.
 *
 * The Awtsmoos lets each HUD fragment serve one job: route progress, mandatory
 * coin ring, wallet, and key seal. The market can now spend a very large Shefa
 * offering to open the next sealed chamber without pretending the ladder became
 * easy; it is expensive, persistent, and still only opens one rung at a time.
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
    this.loop = this.loop.bind(this);
  }

  createWorld(index) { const world = new PhysicsWorld(LEVELS[index]); this.progress.applyToWorld(world); return world; }
  start() { if (this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  pause() { this.running = false; }

  newGame(index = Math.min(this.progress.state.unlocked - 1, this.index || 0)) {
    this.index = Math.max(0, Math.min(LEVELS.length - 1, index));
    this.world = this.createWorld(this.index);
    this.start();
    this.onProgress(this);
  }

  chooseLevel(index) { if (index + 1 > this.progress.state.unlocked) return false; this.newGame(index); return true; }
  buyOrEquipSkin(id) { const result = buySkin(this.progress.state.market, this.progress.state.currency, id); this.afterMarket(result); return result; }
  equipSkin(id) { const result = equipSkin(this.progress.state.market, id); this.afterMarket(result); return result; }

  buyNextLevel() {
    const result = buyLevelUnlock(this.progress.state, LEVELS.length);
    this.afterMarket(result);
    return result;
  }

  afterMarket(result) {
    this.progress.save();
    this.progress.applyToWorld(this.world);
    if (result.ok) this.sound.play('coin');
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
    this.hud.level.textContent = ` ${w.level.name}`;
    this.hud.difficulty.textContent = `D${w.performance.difficulty}`;
    this.hud.progressFill.style.width = `${runProgress}%`;
    this.hud.progressText.textContent = `${runProgress}%`;
    this.hud.coinRing.style.setProperty('--coinPct', String(coinPct));
    this.hud.coinText.textContent = `${collected}/${total}`;
    this.hud.stats.textContent = open ? 'Door open' : `Need ${Math.max(0, total - collected)} coins`;
    this.paintKeyBadge(hasKey);
    this.paintShefaPills(w.currency || {});
  }

  paintKeyBadge(hasKey) {
    this.hud.keyBadge.classList.toggle('locked', !hasKey);
    this.hud.keyBadge.classList.toggle('unlocked', hasKey);
    this.hud.keyBadge.querySelector('span').textContent = hasKey ? 'Key' : 'No key';
  }

  paintShefaPills(currency) {
    const coinPills = COIN_META.map(([key, label]) => `<span class="shefaCoin ${key}" title="${key}"><i>${label}</i><b>${currency[key] || 0}</b></span>`).join('');
    this.hud.shefaPills.innerHTML = `${coinPills}<span class="shefaCoin shefa" title="Shefa"><i>ש</i><b>${currency.shefa || 0}</b></span>`;
  }
}
