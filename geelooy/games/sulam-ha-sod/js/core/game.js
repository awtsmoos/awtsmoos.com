// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { currencyHud } from '../systems/currency.js';
import { SoundEffects } from '../systems/soundEffects.js';

/**
 * Game orchestrates the ladder and the sound of its judgments.
 *
 * The Awtsmoos lets a frame become a chamber, a chamber become a test, and a
 * test become a sound. The loop drains explicit sound events from PhysicsWorld:
 * jump, coin, key, death, and continue. Death waits until the shatter animation
 * has breathed before any input restores the player.
 */
export class Game {
  constructor({ input, renderer, hud }) {
    this.input = input;
    this.renderer = renderer;
    this.hud = hud;
    this.sound = new SoundEffects();
    this.index = 0;
    this.running = false;
    this.world = new PhysicsWorld(LEVELS[0]);
    this.last = 0;
    this.loop = this.loop.bind(this);
  }

  start() { if (this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  pause() { this.running = false; }
  newGame() { this.index = 0; this.world = new PhysicsWorld(LEVELS[0]); this.start(); }

  loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.033, (t - this.last) / 1000 || 0);
    this.last = t;
    const input = this.input.read();
    if (input.ok || input.jump || input.buy) this.sound.unlock();
    if (this.world.deathPause) this.handleDeathPause(input, dt);
    else if (this.world.step(input, dt) === 'next') this.advance();
    this.playWorldSounds();
    this.renderer.draw(this.world);
    this.paintHud();
    requestAnimationFrame(this.loop);
  }

  handleDeathPause(input, dt) {
    this.world.step(input, dt);
    if (input.ok && this.world.continueAfterDeath()) this.playWorldSounds();
  }

  playWorldSounds() {
    for (const name of this.world.drainSoundEvents?.() || []) this.sound.play(name);
  }

  advance() {
    this.index = (this.index + 1) % LEVELS.length;
    this.world = new PhysicsWorld(LEVELS[this.index]);
    this.world.message = this.index ? 'A higher chamber opens.' : 'The ladder returns to dust.';
    this.sound.play('continue');
  }

  paintHud() {
    const w = this.world;
    const progress = Math.max(0, Math.min(100, Math.round((w.player.x / Math.max(1, w.width - w.player.w)) * 100)));
    this.hud.level.textContent = ` ${w.level.name}`;
    this.hud.difficulty.textContent = `D${w.performance.difficulty}`;
    this.hud.progressFill.style.width = `${progress}%`;
    this.hud.progressText.textContent = `${progress}%`;
    this.hud.stats.textContent = `${currencyHud(w.currency)} · Keys ${w.keyCount} · Level ${this.index + 1}/${LEVELS.length}`;
  }
}
