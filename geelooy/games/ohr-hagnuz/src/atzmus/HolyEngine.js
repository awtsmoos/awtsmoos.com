
import { Projector } from '../tiferet/Projector.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';

/**
 * B"H
 * @class HolyEngine
 */
export class HolyEngine {
  static ignite() {
    Projector.warmup();
    Input.bind();

    const pulse = () => {
      Logic.process();
      Projector.project();
      requestAnimationFrame(pulse);
    };

    pulse();
  }
}
