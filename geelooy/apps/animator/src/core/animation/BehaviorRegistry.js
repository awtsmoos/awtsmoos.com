
/* B”H */
import { IDLE_BEHAVIOR } from './behaviors/idle.js';
import { WALK_BEHAVIOR } from './behaviors/walk.js';
import { DANCE_BEHAVIOR } from './behaviors/dance.js';
import { WAVE_BEHAVIOR } from './behaviors/wave.js';
import { JUMP_BEHAVIOR } from './behaviors/jump.js';
import { CLAP_BEHAVIOR } from './behaviors/clap.js';
import { SIT_BEHAVIOR } from './behaviors/sit.js';
import { DIALOGUE_BEHAVIOR } from './behaviors/Dialogue.js';
import { DRINK_BEHAVIOR } from './behaviors/drink.js';

/**
 * @class BehaviorRegistry
 * @description
 * The 'Otzar HaChayim' (Treasury of Life). 
 */
export class BehaviorRegistry {
  static behaviors = {
    idle: IDLE_BEHAVIOR,
    walk: WALK_BEHAVIOR,
    dance: DANCE_BEHAVIOR,
    wave: WAVE_BEHAVIOR,
    jump: JUMP_BEHAVIOR,
    clap: CLAP_BEHAVIOR,
    sit: SIT_BEHAVIOR,
    dialogue: DIALOGUE_BEHAVIOR,
    drink: DRINK_BEHAVIOR
  };

  static get(key) {
    return this.behaviors[key] || this.behaviors.idle;
  }
}
