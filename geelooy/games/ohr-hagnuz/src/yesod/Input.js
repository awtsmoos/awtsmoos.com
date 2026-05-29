import { State } from '../binah/State.js';
import { Logic } from './Logic.js';

/**
 * B"H
 * @class Input
 * @description Binds keyboard and pointer intent to the Ohr HaGnuz runtime.
 * A finger descends upon glass; no body or form of the Awtsmoos is caught there,
 * only the renewed letter of intention, filtered safely into movement and debate choice.
 */
export class Input {
  static bound = false;

  static bind() {
    if (this.bound) return;
    this.bound = true;
    const map = { ArrowUp: 'U', w: 'U', W: 'U', ArrowDown: 'D', s: 'D', S: 'D', ArrowLeft: 'L', a: 'L', A: 'L', ArrowRight: 'R', d: 'R', D: 'R', z: 'A', Z: 'A', Enter: 'A', ' ': 'A', x: 'B', X: 'B', Escape: 'B' };
    window.addEventListener('keydown', e => this.keyDown(e, map));
    window.addEventListener('keyup', e => this.keyUp(e, map));
    this.pointer();
    console.log('B"H - Input bound: arrows/WASD, click-to-move, F1-F4 presets.');
  }

  static keyDown(e, map) {
    if (State.ActiveRealm === 'DEBATE' && /^[1-4]$/.test(e.key)) {
      State.Debate.cursor = Number(e.key) - 1;
      Logic.selectDebateMove(State.Debate.cursor);
      e.preventDefault();
      return;
    }
    const presets = { F1: 'door', F2: 'forest', F3: 'trainer', F4: 'grass' };
    if (presets[e.key]) { window.OhrTest?.preset(presets[e.key]); e.preventDefault(); return; }
    const k = map[e.key];
    if (!k) return;
    window.AwtsmoosIntents[k] = 1;
    if (['U', 'D', 'L', 'R'].includes(k)) Logic.cancelPath('manual-key');
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
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
    if (e.button !== undefined && e.button !== 0) return;
    if (e.isPrimary === false) return;
    e.preventDefault?.();
    if (e.pointerId !== undefined) c.setPointerCapture?.(e.pointerId);
    if (State.ActiveRealm === 'DEBATE') {
      const i = this.debateIndex(e, c);
      if (i !== null) { State.Debate.cursor = i; Logic.selectDebateMove(i); }
      return;
    }
    const t = this.tile(e, c);
    if (t) Logic.setPathTo(t.x, t.y);
  }

  static tile(e, c) {
    const r = c.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return null;
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
    const slots = [
      { x: 52, y: 448, w: 312, h: 34, i: 0 },
      { x: 52, y: 490, w: 312, h: 34, i: 1 },
      { x: 410, y: 448, w: 312, h: 34, i: 2 },
      { x: 410, y: 490, w: 312, h: 34, i: 3 }
    ];
    const hit = slots.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
    return hit ? hit.i : null;
  }
}
