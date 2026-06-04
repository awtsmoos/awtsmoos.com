/**
 * B"H
 * @class Input
 * @description Keyboard, battle-card, dialogue, panel, and canvas pointer input.
 *
 * Chapter 194: The finger learned what not to awaken. The Awtsmoos has no body
 * and no form, yet the phone screen must know: when a panel or dialogue is
 * open, no world click becomes movement. UI first, learning first, feet later.
 */
import { State } from '../binah/State.js';
import { Logic } from './Logic.js';
import { battleMoveLayout, moveIndexAt } from '../tiferet/render/BattleMoveLayout.js';

export class Input {
  static bound = false;

  static bind() {
    if (this.bound) return;
    this.bound = true;
    const map = this.keyMap();
    window.addEventListener('keydown', e => this.keyDown(e, map), { passive: false });
    window.addEventListener('keyup', e => this.keyUp(e, map), { passive: false });
    this.pointer();
  }

  static keyMap() {
    return { ArrowUp:'U', w:'U', W:'U', ArrowDown:'D', s:'D', S:'D', ArrowLeft:'L', a:'L', A:'L', ArrowRight:'R', d:'R', D:'R', z:'A', Z:'A', Enter:'A', ' ':'A', x:'B', X:'B', Escape:'B' };
  }

  static keyDown(e, map) {
    if (State.Dialogue.open) return this.dialogueKey(e);
    if (State.UiPanel) {
      if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') State.openPanel(null);
      e.preventDefault?.();
      return;
    }
    if (State.ActiveRealm === 'DEBATE' && /^[1-4]$/.test(e.key)) {
      this.commitDebate(Number(e.key) - 1);
      e.preventDefault?.();
      return;
    }
    const k = map[e.key];
    if (!k) return;
    window.AwtsmoosIntents[k] = 1;
    if (['U', 'D', 'L', 'R'].includes(k)) Logic.cancelPath('manual-key');
    e.preventDefault?.();
  }

  static dialogueKey(e) {
    if (['Enter', ' ', 'z', 'Z'].includes(e.key)) State.dialogueNext(1);
    else if (['x', 'X', 'Escape'].includes(e.key)) State.closeDialogue(true);
    else if (['ArrowLeft', 'a', 'A'].includes(e.key)) State.dialogueNext(-1);
    else if (['ArrowRight', 'd', 'D'].includes(e.key)) State.dialogueNext(1);
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
    target.addEventListener('pointerdown', e => this.pointerDown(e, canvas), { passive: false });
    target.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });
    target.addEventListener('selectstart', e => e.preventDefault(), { passive: false });
    target.addEventListener('dragstart', e => e.preventDefault(), { passive: false });
  }

  static pointerDown(e, canvas) {
    if (e.target?.closest?.('button, .ohr-panel, .ohr-dialogue, .ohr-world-card')) return;
    e.preventDefault?.();
    e.stopPropagation?.();
    canvas.setPointerCapture?.(e.pointerId);
    if (State.isUiBlocking()) {
      State.releaseIntents();
      return;
    }
    if (State.ActiveRealm === 'DEBATE') {
      const i = this.debateIndex(e, canvas);
      if (i !== null) this.commitDebate(i);
      return;
    }
    const tile = this.tile(e, canvas);
    if (tile) Logic.setPathTo(tile.x, tile.y);
  }

  static commitDebate(index) { State.Debate.cursor = index; Logic.selectDebateMove(index); }

  static point(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }

  static tile(e, canvas) {
    const p = this.point(e, canvas);
    const res = State.Resolution;
    const camX = State.Hero.cx * res - canvas.width / 2 + res / 2;
    const camY = State.Hero.cy * res - canvas.height / 2 + res / 2;
    return { x: Math.floor((p.x + camX) / res), y: Math.floor((p.y + camY) / res) };
  }

  static debateIndex(e, canvas) {
    const p = this.point(e, canvas);
    const layout = battleMoveLayout(canvas.width, canvas.height);
    return moveIndexAt(p.x, p.y, layout);
  }
}
