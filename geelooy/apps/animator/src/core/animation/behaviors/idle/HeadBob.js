/* B”H */
export class HeadBobBehavior {
  static calculate(time, mood = 'calm') {
    let speed = 0.003;
    let amplitude = 4;

    if (mood === 'energetic') { speed = 0.006; amplitude = 8; }
    if (mood === 'nervous') { speed = 0.015; amplitude = 2; }
    if (mood === 'happy') { speed = 0.004; amplitude = 6; }

    return Math.sin(time * speed) * amplitude;
  }
}
