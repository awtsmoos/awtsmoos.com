/* B”H */
export class WeightShiftBehavior {
  static calculate(time, mood = 'calm') {
    let speed = 0.0005;
    let amplitude = 10;

    if (mood === 'energetic') { speed = 0.001; amplitude = 15; }
    if (mood === 'nervous') { speed = 0.002; amplitude = 5; }
    if (mood === 'happy') { speed = 0.0008; amplitude = 12; }

    return Math.sin(time * speed) * amplitude;
  }
}
