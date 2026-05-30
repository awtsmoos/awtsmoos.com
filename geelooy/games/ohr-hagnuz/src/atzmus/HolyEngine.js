import { Projector } from '../tiferet/Projector.js';
import { MobileControls } from '../tiferet/ui/MobileControls.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';
import { State } from '../binah/State.js';

/**
 * B"H
 * @class HolyEngine
 *
 * Chapter 19: The Pulse Grew Hands Without Becoming A Body.
 * The Awtsmoos has no body and no form; the engine only binds vessels: canvas,
 * input, mobile controls, state, and the endless requestAnimationFrame river.
 */
export class HolyEngine {
  static ignite() {
    console.log('B"H - HolyEngine igniting...');
    Projector.warmup();
    MobileControls.mount();
    Input.bind();
    State.Message = 'B"H - The world awakens. Walk, talk, and reveal hidden light.';
    State.MessageTTL = 600;

    const pulse = () => {
      Logic.process();
      Projector.project();
      MobileControls.update();
      requestAnimationFrame(pulse);
    };

    pulse();
  }
}
