
/* B"H */
import { ANIMATION_REGISTRY } from '../../../../animation/data/AnimationRegistry.js';

export class SwayBehavior {
  static calculate(time, mood = 'calm') {
    const moodConfig = ANIMATION_REGISTRY.idle[mood] || ANIMATION_REGISTRY.idle.calm;

    let speed = 0.001;
    let amplitude = moodConfig.swayAmp || 15;

    if (mood === 'energetic') { speed = 0.003; amplitude = 25; }
    if (mood === 'nervous') { speed = 0.01; amplitude = 5; } // Shivering
    if (mood === 'happy') { speed = 0.002; amplitude = 20; }

    return Math.sin(time * speed) * amplitude;
  }
}
