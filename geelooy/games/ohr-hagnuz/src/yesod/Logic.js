import { State } from '../binah/State.js';
import { canPass, edgePortal, setPathTo, tileAt, transfer } from './OhrWorld.js';
import { debateTick, selectDebateMove } from './OhrDebate.js';
import { handleActionFacing, handleArrival } from './OhrEncounter.js';
import { installOhrTest } from './OhrTestHarness.js';

/**
 * B"H
 * @class Logic
 * Small conductor: movement, arrival hooks, and delegation to small systems.
 */
export class Logic {
  static held = { a: 0, b: 0, u: 0, d: 0 };
  static ready = false;

  static process() {
    if (!this.ready) { installOhrTest(); this.ready = true; }
    if (State.MessageTTL > 0) State.MessageTTL--;
    if (State.ActiveRealm === 'DEBATE') return debateTick(this.held);

    const H = State.Hero;
    if (H.moving) return this.animate();

    const next = this.nextStep();
    if (next) this.step(next.dx, next.dy, next.dir);
    this.action();
  }

  static nextStep() {
    const i = window.AwtsmoosIntents || {};
    if (i.U) return { dx: 0, dy: -1, dir: 'u' };
    if (i.D) return { dx: 0, dy: 1, dir: 'd' };
    if (i.L) return { dx: -1, dy: 0, dir: 'l' };
    if (i.R) return { dx: 1, dy: 0, dir: 'r' };

    const H = State.Hero;
    const target = State.HeroPath?.[0];
    if (!target) return null;

    const dx = Math.sign(target.x - H.cx);
    const dy = Math.sign(target.y - H.cy);
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      State.HeroPath = [];
      return null;
    }
    return { dx, dy, dir: dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u' };
  }

  static step(dx, dy, dir) {
    const H = State.Hero;
    H.dir = dir;
    const x = H.cx + dx;
    const y = H.cy + dy;

    if (!canPass(x, y)) {
      State.HeroPath = [];
      const portal = edgePortal(x, y);
      if (portal) transfer(portal);
      else State.say('That way is blocked.', 120);
      return;
    }

    H.moving = true;
    H.cx = x;
    H.cy = y;
  }

  static animate() {
    const H = State.Hero, res = State.Resolution, speed = State.Speed;
    if (H.dir === 'u') H.dy -= speed;
    if (H.dir === 'd') H.dy += speed;
    if (H.dir === 'l') H.dx -= speed;
    if (H.dir === 'r') H.dx += speed;
    H.stepTick += speed;

    if (H.stepTick >= res) {
      H.moving = false;
      H.stepTick = 0;
      H.dx = H.cx * res;
      H.dy = H.cy * res;
      if (State.HeroPath?.[0]?.x === H.cx && State.HeroPath?.[0]?.y === H.cy) State.HeroPath.shift();
      handleArrival();
    }
  }

  static action() {
    const i = window.AwtsmoosIntents || {};
    if (i.A && !this.held.a) handleActionFacing(this.front());
    this.held.a = i.A;
  }

  static front() {
    const H = State.Hero;
    const d = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[H.dir] || [0, 1];
    const x = H.cx + d[0], y = H.cy + d[1];
    return { x, y, tile: tileAt(x, y) };
  }

  static setPathTo(x, y) { return setPathTo(x, y); }
  static selectDebateMove(index) { return selectDebateMove(index); }
}
