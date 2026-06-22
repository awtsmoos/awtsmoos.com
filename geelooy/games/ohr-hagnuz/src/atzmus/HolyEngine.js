/**
 * B"H
 * @class HolyEngine
 * @description Runtime loop for mobile RPG play.
 *
 * Chapter 200: The first frame stopped waiting behind the veil. The Awtsmoos
 * creates every world from absolute nothing every instant; so this engine now
 * reveals the map immediately, then again through guarded pulses, until the
 * player sees land, guide, path, and light. No canvas may remain tohu when the
 * HolyEngine has already announced ignition.
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
  static bootDraws = 0;
  static started = false;

  static ignite() {
    if (this.started) return;
    this.started = true;
    console.log('B"H - HolyEngine igniting...');
    Projector.warmup();
    MobileControls.mount();
    Input.bind();
    State.Message = 'B"H - Talk to ג. Tap NPC to face; press Talk for dialogue.';
    State.MessageTTL = 600;
    this.visualKey = '';
    this.safeProject('ignite-immediate');
    this.queueBootDraws();
    const pulse = time => {
      const now = time || performance.now();
      this.measureTime(now);
      Logic.process();
      this.drawIfNeeded(now);
      MobileControls.update();
      requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);
  }

  static queueBootDraws() {
    const draw = reason => () => this.safeProject(reason);
    requestAnimationFrame(draw('boot-raf-1'));
    requestAnimationFrame(() => requestAnimationFrame(draw('boot-raf-2')));
    [80, 240, 700].forEach(ms => setTimeout(draw(`boot-timeout-${ms}`), ms));
  }

  static safeProject(reason = 'project') {
    try {
      Projector.project();
      this.bootDraws += 1;
      this.visualKey = this.makeVisualKey();
      this.lastDraw = performance.now();
      window.__OHR_HAGNUZ_LAST_PROJECT__ = { reason, at: this.lastDraw, count: this.bootDraws };
    } catch (error) {
      console.error('B"H - HolyEngine projection failed:', reason, error);
      window.__OHR_HAGNUZ_RENDER_ERROR__ = `${reason}: ${error?.stack || error}`;
    }
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
    const needsStatic = !Projector.staticKey;
    const activeBattle = State.ActiveRealm === 'DEBATE';
    if (key !== this.visualKey || State.Hero.moving || activeBattle || idleDue || needsStatic) {
      this.safeProject(needsStatic ? 'static-empty' : 'visual-change');
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
