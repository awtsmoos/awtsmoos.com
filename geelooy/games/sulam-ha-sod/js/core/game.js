// B"H
import { LEVELS } from '../data/levels.js';
import { PhysicsWorld } from './physics.js';
/**
 * Chapter 2: the conductor now waits behind a curtain until play is chosen.
 * When the traveler returns to menu, time itself bows; when play resumes,
 * the Awtsmoos restarts the ladder without duplicating the animation flame.
 */
export class Game {
  /** @param {{input:object,renderer:object,hud:object}} deps engine dependencies */
  constructor({input, renderer, hud}){
    this.input = input; this.renderer = renderer; this.hud = hud; this.index = 0; this.running = false;
    this.world = new PhysicsWorld(LEVELS[this.index]); this.last = 0; this.loop = this.loop.bind(this);
  }
  /** Start or resume the animation lifecycle. */
  start(){ if(this.running) return; this.running = true; this.last = 0; requestAnimationFrame(this.loop); }
  /** Stop simulation while the menu is open. */
  pause(){ this.running = false; }
  /** Reset the adventure to the first level and start. */
  newGame(){ this.index = 0; this.world = new PhysicsWorld(LEVELS[0]); this.start(); }
  /** @param {number} t high resolution timestamp */
  loop(t){
    if(!this.running) return; const dt = Math.min(0.033, (t - this.last) / 1000 || 0); this.last = t;
    if(this.world.step(this.input.read(), dt) === 'next') this.advance();
    this.renderer.draw(this.world); this.paintHud(); requestAnimationFrame(this.loop);
  }
  /** Move into next level, wrapping after the current campaign. */
  advance(){
    this.index = (this.index + 1) % LEVELS.length; this.world = new PhysicsWorld(LEVELS[this.index]);
    this.world.message = this.index ? 'A higher bridge appears from hidden light.' : 'The ladder loops back, harder in your hands.';
  }
  /** Push score, stomp, and level state into DOM text vessels. */
  paintHud(){
    this.hud.level.textContent = ` ${this.world.level.name}`;
    this.hud.stats.textContent = `Coins ${this.world.score} · Keys ${this.world.keyCount} · Stomps ${this.world.player.stomps} · Level ${this.index+1}`;
  }
}
