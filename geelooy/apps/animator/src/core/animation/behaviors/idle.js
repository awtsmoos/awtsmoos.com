
/* B”H */
import { SwayBehavior } from './idle/Sway.js';
import { BreathBehavior } from './idle/Breath.js';
import { BlinkBehavior } from './idle/Blink.js';
import { HeadBobBehavior } from './idle/HeadBob.js';
import { WeightShiftBehavior } from './idle/WeightShift.js';

/**
 * @constant IDLE_BEHAVIOR
 * @description
 * The 'Kohan' of behaviors, maintaining the constant fire on the altar.
 * Now robust against state-access failures.
 */
export const IDLE_BEHAVIOR = (time, stateOrMood) => {
  // Gracefully handle if state is a manager or just a mood string
  let mood = 'calm';
  if (typeof stateOrMood === 'string') {
    mood = stateOrMood;
  } else if (stateOrMood && typeof stateOrMood.get === 'function') {
    mood = stateOrMood.get('character')?.mood || 'calm';
  }
  
  return {
    sway: SwayBehavior.calculate(time, mood),
    breath: BreathBehavior.calculate(time, mood),
    blink: BlinkBehavior.calculate(time, mood),
    headBob: HeadBobBehavior.calculate(time, mood),
    weightShift: WeightShiftBehavior.calculate(time, mood)
  };
};
