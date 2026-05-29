import { State } from '../binah/State.js';
import { Logic } from './Logic.js';
import { moveIndexAt } from '../tiferet/render/BattleMoveLayout.js';

/**
 * B"H
 * @class Input
 *
 * Chapter 16: The Finger And The Painted Gate Became One Witness.
 * The Awtsmoos has no body and no form; still, if a button is drawn in one
 * place and touched in another, the vessel is false. This input class now asks
 * the same layout oracle the renderer uses, so mobile battles become exact.
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
      State.Debate.cursor = Number(e.key) - 1;
      Logic.selectDebateMove(State.Debate.cursor);
      e.preventDefault();
      return;
    }
    const k = map[e.key];
    if (!k) return;
    window.AwtsmoosIntents[k] = 1;
    if (['U','D','L','R'].includes(k)) Logic.cancelPath('manual-key');
    e.preventDefault?.();
  }

  static keyUp(e, map) {
    const k = map[e.key];
    if (k) window.AwtsmoosIntents[k] = 0;
  }

  static pointer() {
    const c = document.getElementById('layer-obj');
    if (!c) return;
    c.addEventListener('pointerdown', e => this.pointerDown(e, c));
  }

  static pointerDown(e, c) {
    e.preventDefault?.();
    if (State.ActiveRealm === 'DEBATE') {
      const i = this.debateIndex(e, c);
      if (i !== null) {
        State.Debate.cursor = i;
        Logic.selectDebateMove(i);
      }
      return;
    }
    const tile = this.tile(e, c);
    if (tile) Logic.setPathTo(tile.x, tile.y);
  }

  static tile(e, c) {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) * (c.width / r.width);
    const y = (e.clientY - r.top) * (c.height / r.height);
    const res = State.Resolution;
    const camX = State.Hero.dx - c.width / 2 + res / 2;
    const camY = State.Hero.dy - c.height / 2 + res / 2;
    return { x: Math.floor((x + camX) / res), y: Math.floor((y + camY) / res) };
  }

  static debateIndex(e, c) {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) * (c.width / r.width);
    const y = (e.clientY - r.top) * (c.height / r.height);
    return moveIndexAt(x, y, c.width, r.width);
  }
}
