// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { currencyHud } from '../systems/currency.js';
import { SoundEffects } from '../systems/soundEffects.js';
import { ProgressionStore } from '../systems/progression.js';
import { buySkin, equipSkin } from '../systems/market.js';

/**
 * Game orchestrates chambers, persistence, shop, and level unlocks.
 *
 * The Awtsmoos lets ascent leave a trace: coins buy garments, finished levels
 * unlock later chambers, and the main menu can choose any opened rung.
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

  createWorld(index) {
    const world = new PhysicsWorld(LEVELS[index]);
    this.progress.applyToWorld(world);
    return world;
  }

  start() { if (this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  pause() { this.running = false; }

  newGame(index = Math.min(this.progress.state.unlocked - 1, this.index || 0)) {
    this.index = Math.max(0, Math.min(LEVELS.length - 1, index));
    this.world = this.createWorld(this.index);
    this.start();
    this.onProgress(this);
  }

  chooseLevel(index) {
    if (index + 1 > this.progress.state.unlocked) return false;
    this.newGame(index);
    return true;
  }

  buyOrEquipSkin(id) {
    const result = buySkin(this.progress.state.market, this.progress.state.currency, id);
    this.progress.save();
    this.progress.applyToWorld(this.world);
    this.onProgress(this);
    return result;
  }

  equipSkin(id) {
    const result = equipSkin(this.progress.state.market, id);
    this.progress.save();
    this.progress.applyToWorld(this.world);
    this.onProgress(this);
    return result;
  }

  loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.033, (t - this.last) / 1000 || 0);
    this.last = t;
    const input = this.input.read();
    if (input.ok || input.jump) this.sound.unlock();
    this.world.visibleCameraX = this.renderer.camera?.x ?? this.world.visibleCameraX ?? 0;
    if (this.world.deathPause) this.handleDeathPause(input, dt);
    else if (this.world.step(input, dt) === 'next') this.advance();
    this.playWorldSounds();
    this.renderer.draw(this.world);
    this.paintHud();
    this.progress.syncFromWorld(this.world);
    requestAnimationFrame(this.loop);
  }

  handleDeathPause(input, dt) {
    this.world.step(input, dt);
    if (input.ok && this.world.continueAfterDeath()) this.playWorldSounds();
  }

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
    const progress = Math.max(0, Math.min(100, Math.round((w.player.x / Math.max(1, w.width - w.player.w)) * 100)));
    const coins = `${w.realCoinsCollected || 0}/${w.realCoinTotal || 0}`;
    const key = `${w.keyCount > 0 ? 1 : 0}/1`;
    const lock = w.canExit?.() ? 'Door OPEN' : `Door locked · Coins ${coins} · Key ${key}`;
    this.hud.level.textContent = ` ${w.level.name}`;
    this.hud.difficulty.textContent = `D${w.performance.difficulty}`;
    this.hud.progressFill.style.width = `${progress}%`;
    this.hud.progressText.textContent = `${progress}%`;
    this.hud.stats.textContent = `${lock} · ${currencyHud(w.currency)} · Level ${this.index + 1}/${LEVELS.length}`;
  }
}
