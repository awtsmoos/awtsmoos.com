
import { Projector } from '../tiferet/Projector.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';
import { State } from '../binah/State.js';

/**
 * B"H
 * @class HolyEngine
 * The Divine Will that ignites the game world.
 */
export class HolyEngine {
  static ignite() {
    console.log('B"H - HolyEngine igniting...');
    
    // Initialize display canvases
    Projector.warmup();
    console.log('B"H - Projector warmed up.');
    
    // Bind input handlers
    Input.bind();
    console.log('B"H - Input bound to DOM.');
    
    // Initialize game state
    State.Message = 'B"H - The world awakens. Click to walk. Press F1-F4 for test presets.';
    State.MessageTTL = 600;
    console.log('B"H - State initialized:', State.MapId, 'at', State.Hero.cx, State.Hero.cy);
    
    // Main game loop
    const pulse = () => {
      Logic.process();
      Projector.project();
      requestAnimationFrame(pulse);
    };
    
    console.log('B"H - HolyEngine pulse started.');
    pulse();
  }
}
