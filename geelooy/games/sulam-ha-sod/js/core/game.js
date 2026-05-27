// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
import { currencyHud } from '../systems/currency.js';
import { marketHud } from '../systems/market.js';
/**
 * Chapter 39: raw distance became a glowing river. Progress, difficulty,
 * nearby collision checks, and market state now flow through a polished HUD,
 * because the Awtsmoos likes speed best when the eye understands it instantly.
 */
export class Game {
  /** @param {{input:object,renderer:object,hud:object}} deps engine dependencies */
  constructor({input, renderer, hud}){
    this.input = input; this.renderer = renderer; this.hud = hud; this.index = 0; this.running = false;
    this.world = new PhysicsWorld(LEVELS[this.index]); this.last = 0; this.loop = this.loop.bind(this);
  }
  start(){ if(this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  pause(){ this.running = false; }
  newGame(){ this.index = 0; this.world = new PhysicsWorld(LEVELS[0]); this.start(); }
  /** @param {number} t high resolution timestamp */
  loop(t){
    if(!this.running) return; const dt = Math.min(0.033, (t - this.last) / 1000 || 0); this.last = t;
    if(this.world.step(this.input.read(), dt) === 'next') this.advance();
    this.renderer.draw(this.world); this.paintHud(); requestAnimationFrame(this.loop);
  }
  advance(){
    this.index = (this.index + 1) % LEVELS.length; this.world = new PhysicsWorld(LEVELS[this.index]);
    this.world.message = this.index ? 'A higher bridge appears from hidden light.' : 'The ladder loops back, harder in your hands.';
  }
  paintHud(){
    const w = this.world, p = w.player, progress = Math.max(0, Math.min(100, Math.round((p.x / Math.max(1,w.width-p.w)) * 100)));
    const warnings = w.spikes.warning().length, active = w.spikes.active().length;
    this.hud.level.textContent = ` ${w.level.name}`; this.hud.difficulty.textContent = `D${w.performance.difficulty}`;
    this.hud.difficulty.style.setProperty('--heat', `${Math.min(100,w.performance.difficulty*16)}%`);
    this.hud.progressFill.style.width = `${progress}%`; this.hud.progressText.textContent = `${progress}%`;
    this.hud.stats.textContent = `${currencyHud(w.currency)} · ${marketHud(w.market,w.currency)} · Keys ${w.keyCount} · Stomps ${p.stomps} · Spikes ${warnings}/${active} · Checks ${w.performance.platformChecks}/${w.performance.totalPlatforms} · L${this.index+1}/${LEVELS.length}`;
  }
}
