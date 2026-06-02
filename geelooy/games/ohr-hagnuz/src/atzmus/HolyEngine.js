import { Projector } from '../tiferet/Projector.js';
import { MobileControls } from '../tiferet/ui/MobileControls.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';
import { State } from '../binah/State.js';

/**
 * B"H
 * @class HolyEngine
 * @description Low-churn runtime loop for mobile RPG play.
 *
 * Chapter 118: The pulse learned not every silence needs a painting. The
 * Awtsmoos renews all worlds without fatigue; the browser does not. Logic still
 * receives the living river, but canvas projection only occurs when motion,
 * battle, message, panel, path, map, or hero state demands a new picture.
 */
export class HolyEngine {
  static visualKey = '';
  static lastDraw = 0;
  static maxIdleFps = 8;

  /** @returns {void} */
  static ignite() {
    console.log('B"H - HolyEngine igniting...');
    Projector.warmup();
    MobileControls.mount();
    Input.bind();
    State.Message = 'B"H - The world awakens. Walk, talk, and reveal hidden light.';
    State.MessageTTL = 600;
    const pulse = time => {
      Logic.process();
      this.drawIfNeeded(time || performance.now());
      MobileControls.update();
      requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);
  }

  /** @param {number} time @returns {void} */
  static drawIfNeeded(time) {
    const key = this.makeVisualKey();
    const idleDue = time - this.lastDraw > 1000 / this.maxIdleFps;
    if (key !== this.visualKey || State.Hero.moving || State.ActiveRealm === 'DEBATE' || idleDue) {
      this.visualKey = key;
      this.lastDraw = time;
      Projector.project();
    }
  }

  /** @returns {string} */
  static makeVisualKey() {
    const h = State.Hero;
    return [
      State.ActiveRealm,
      State.MapId,
      h.cx, h.cy, h.dx, h.dy, h.dir, h.moving ? 1 : 0, h.stepTick,
      State.PathTarget?.x ?? '', State.PathTarget?.y ?? '', State.PathTarget?.valid ?? '',
      State.HeroPath.length,
      State.Message, State.MessageTTL > 0 ? 1 : 0,
      State.Stats.light, State.Stats.sparks, State.Stats.level,
      State.UiPanel || ''
    ].join('|');
  }
}
