import { State } from '../binah/State.js';
import { Logic } from './Logic.js';
import { battleMoveLayout, moveIndexAt } from '../tiferet/render/BattleMoveLayout.js';

/**
 * B"H
 * @class Input
 *
 * Chapter 55: The finger finally touched the same card the eye could see.
 * The Awtsmoos has no body and no form; this input vessel now measures the
 * live canvas correctly, feeds the same battle layout used by rendering, and
 * keeps overworld walking separate from Torah-response tapping.
 */
export class Input {
  static bound = false;

  static bind() {
    if (this.bound) return;
    this.bound = true;
    const map = { ArrowUp:'U', w:'U', W:'U', ArrowDown:'D', s:'D', S:'D', ArrowLeft:'L', a:'L', A:'L', ArrowRight:'R', d:'R', D:'R', z:'A', Z:'A', Enter:'A', ' ':'A', x:'B', X:'B', Escape:'B' };
    window.addEventListener('keydown', e => this.keyDown(e, map));
    window.addEventListener('keyup', e => this.keyUp(e, map));
    this.pointer();
  }

  static keyDown(e, map) {
    if (State.ActiveRealm === 'DEBATE' && /^[1-4]$/.test(e.key)) {
      this.commitDebate(Number(e.key) - 1);
      e.preventDefault();
      return;
    }
    const k = map[e.key];
    if (!k) return;
    window.AwtsmoosIntents[k] = 1;
    if (['U', 'D', 'L', 'R'].includes(k)) Logic.cancelPath('manual-key');
    e.preventDefault?.();
  }

  static keyUp(e, map) {
    const k = map[e.key];
    if (k) window.AwtsmoosIntents[k] = 0;
  }

  static pointer() {
    const shell = document.getElementById('game-shell');
    const canvas = document.getElementById('layer-obj');
    const target = shell || canvas;
    if (!target || !canvas) return;
    target.addEventListener('pointerdown', e => this.pointerDown(e, canvas));
  }

  static pointerDown(e, canvas) {
    if (e.target?.closest?.('button')) return;
    e.preventDefault?.();
    if (State.ActiveRealm === 'DEBATE') {
      const i = this.debateIndex(e, canvas);
      if (i !== null) this.commitDebate(i);
      return;
    }
    const tile = this.tile(e, canvas);
    if (tile) Logic.setPathTo(tile.x, tile.y);
  }

  static commitDebate(index) {
    State.Debate.cursor = index;
    Logic.selectDebateMove(index);
  }

  static point(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height)
    };
  }

  static tile(e, canvas) {
    const p = this.point(e, canvas);
    const res = State.Resolution;
    const camX = State.Hero.dx - canvas.width / 2 + res / 2;
    const camY = State.Hero.dy - canvas.height / 2 + res / 2;
    return { x: Math.floor((p.x + camX) / res), y: Math.floor((p.y + camY) / res) };
  }

  static debateIndex(e, canvas) {
    const p = this.point(e, canvas);
    const layout = battleMoveLayout(canvas.width, canvas.height);
    return moveIndexAt(p.x, p.y, layout);
  }
}
