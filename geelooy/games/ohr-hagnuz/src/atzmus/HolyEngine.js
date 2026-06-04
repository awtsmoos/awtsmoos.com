/**
 * B"H
 * @class HolyEngine
 * @description Runtime loop for mobile RPG play.
 *
 * Chapter 196: The renderer learned that dialogue is a visible world. The
 * Awtsmoos has no body and no form, yet when a guide speaks, the UI must redraw
 * as surely as when the hero walks. Dialogue index, panel state, and blocking
 * status now participate in the visual key.
 */
import { Projector } from '../tiferet/Projector.js';
import { MobileControls } from '../tiferet/ui/MobileControls.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';
import { State } from '../binah/State.js';

export class HolyEngine {
  static visualKey = '';
  static lastDraw = 0;
  static lastPulse = 0;
  static maxIdleFps = 8;

  static ignite() {
    console.log('B"H - HolyEngine igniting...');
    Projector.warmup();
    MobileControls.mount();
    Input.bind();
    State.Message = 'B"H - Talk to ג. Tap NPC to face; press Talk for dialogue.';
    State.MessageTTL = 600;
    const pulse = time => {
      this.measureTime(time || performance.now());
      Logic.process();
      this.drawIfNeeded(time || performance.now());
      MobileControls.update();
      requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);
  }

  static measureTime(time) {
    if (!this.lastPulse) { this.lastPulse = time; State.setFrameDeltaScale(1); return; }
    const delta = Math.max(8, Math.min(34, time - this.lastPulse));
    this.lastPulse = time;
    State.setFrameDeltaScale(delta / 16.6667);
  }

  static drawIfNeeded(time) {
    const key = this.makeVisualKey();
    const idleDue = time - this.lastDraw > 1000 / this.maxIdleFps;
    if (key !== this.visualKey || State.Hero.moving || State.ActiveRealm === 'DEBATE' || idleDue) {
      this.visualKey = key;
      this.lastDraw = time;
      Projector.project();
    }
  }

  static makeVisualKey() {
    const h = State.Hero;
    const d = State.Dialogue;
    return [
      State.ActiveRealm, State.MapId, h.cx, h.cy, Math.round(h.dx * 10) / 10, Math.round(h.dy * 10) / 10,
      h.dir, h.moving ? 1 : 0, Math.round(h.stepTick * 10) / 10,
      State.PathTarget?.x ?? '', State.PathTarget?.y ?? '', State.PathTarget?.valid ?? '', State.PathTarget?.faceOnly ?? '',
      State.HeroPath.length, State.Message, State.MessageTTL > 0 ? 1 : 0,
      State.Stats.light, State.Stats.sparks, State.Stats.level, State.UiPanel || '',
      d.open ? 1 : 0, d.glyph || '', d.index || 0, d.lines?.length || 0
    ].join('|');
  }
}
