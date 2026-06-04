/**
 * B"H
 * @class Logic
 * @description Movement, UI blocking, NPC facing, arrival hooks, and debate delegation.
 *
 * Chapter 193: The feet learned to wait while the mind reads. The Awtsmoos has
 * no body and no form, yet a UI panel is a sacred pause. While dialogue or
 * panels are open, no path advances, no joystick leaks, and the player can
 * track the mission without the hero wandering under their finger.
 */
import { State } from '../binah/State.js';
import { canPass, edgePortal, faceTile, setPathTo, tileAt, transfer } from './OhrWorld.js';
import { debateTick, selectDebateMove } from './OhrDebate.js';
import { handleActionFacing, handleArrival } from './OhrEncounter.js';
import { installOhrTest } from './OhrTestHarness.js';
import { PathVisualizer } from '../chochmah/PathVisualizer.js';

export class Logic {
  static held = { a: 0, b: 0, u: 0, d: 0 };
  static ready = false;

  static process() {
    if (!this.ready) { installOhrTest(); this.ready = true; }
    if (State.MessageTTL > 0) State.MessageTTL -= 1;
    if (State.ActiveRealm === 'DEBATE') return debateTick(this.held);
    if (State.isUiBlocking()) return this.pauseForUi();
    const H = State.Hero;
    if (H.moving) return this.animate();
    const next = this.nextStep();
    if (next) this.step(next.dx, next.dy, next.dir);
    this.action();
  }

  static pauseForUi() {
    State.clearPath();
    PathVisualizer.clear();
    State.releaseIntents();
    const H = State.Hero;
    if (H.moving) {
      H.moving = false;
      H.stepTick = 0;
      H.dx = H.cx * State.Resolution;
      H.dy = H.cy * State.Resolution;
    }
  }

  static cancelPath(reason = 'cancelled') {
    if (!State.HeroPath.length && !State.PathTarget) return;
    State.clearPath();
    PathVisualizer.clear();
    if (reason === 'manual-key') State.say('Manual movement took over.', 90);
  }

  static nextStep() {
    const i = window.AwtsmoosIntents || {};
    if (i.U) return { dx: 0, dy: -1, dir: 'u', manual: true };
    if (i.D) return { dx: 0, dy: 1, dir: 'd', manual: true };
    if (i.L) return { dx: -1, dy: 0, dir: 'l', manual: true };
    if (i.R) return { dx: 1, dy: 0, dir: 'r', manual: true };
    const H = State.Hero;
    const target = State.HeroPath?.[0];
    if (!target) return null;
    const dx = Math.sign(target.x - H.cx);
    const dy = Math.sign(target.y - H.cy);
    if (Math.abs(dx) + Math.abs(dy) !== 1) { this.cancelPath('broken-path'); return null; }
    return { dx, dy, dir: dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u', manual: false };
  }

  static step(dx, dy, dir) {
    const H = State.Hero;
    H.dir = dir;
    const x = H.cx + dx;
    const y = H.cy + dy;
    if (!canPass(x, y)) return this.blockedStep(x, y);
    H.moving = true;
    H.cx = x;
    H.cy = y;
  }

  static blockedStep(x, y) {
    this.cancelPath('blocked');
    const portal = edgePortal(x, y);
    if (portal) transfer(portal);
    else State.say('That way is blocked.', 120);
  }

  static animate() {
    const H = State.Hero;
    const res = State.Resolution;
    const move = Math.min(res - H.stepTick, State.Speed * (State.FrameDeltaScale || 1));
    const vector = this.directionVector(H.dir);
    H.dx += vector.x * move;
    H.dy += vector.y * move;
    H.stepTick += move;
    if (H.stepTick < res - 0.001) return;
    this.finishStep();
  }

  static directionVector(dir) {
    return { u: { x: 0, y: -1 }, d: { x: 0, y: 1 }, l: { x: -1, y: 0 }, r: { x: 1, y: 0 } }[dir] || { x: 0, y: 1 };
  }

  static finishStep() {
    const H = State.Hero;
    const res = State.Resolution;
    H.moving = false;
    H.stepTick = 0;
    H.dx = H.cx * res;
    H.dy = H.cy * res;
    if (State.HeroPath?.[0]?.x === H.cx && State.HeroPath?.[0]?.y === H.cy) State.HeroPath.shift();
    if (!State.HeroPath.length && State.PathTarget?.faceOnly) {
      faceTile(State.PathTarget.x, State.PathTarget.y);
      State.say('Facing guide. Press Talk to open dialogue.', 180);
      return;
    }
    if (!State.HeroPath.length && State.PathTarget?.valid) State.PathTarget = null;
    handleArrival();
  }

  static action() {
    const i = window.AwtsmoosIntents || {};
    if (i.A && !this.held.a) handleActionFacing(this.front());
    this.held.a = i.A;
  }

  static front() {
    const H = State.Hero;
    const d = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[H.dir] || [0, 1];
    const x = H.cx + d[0];
    const y = H.cy + d[1];
    return { x, y, tile: tileAt(x, y) };
  }

  static setPathTo(x, y) { return setPathTo(x, y); }
  static selectDebateMove(index) { return selectDebateMove(index); }
}
