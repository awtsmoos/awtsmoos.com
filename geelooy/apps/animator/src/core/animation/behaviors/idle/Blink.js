/* B”H */
export class BlinkBehavior {
  static calculate(time, mood = 'calm') {
    let interval = 4000;
    if (mood === 'energetic') interval = 2000;
    if (mood === 'nervous') interval = 1000;
    if (mood === 'happy') interval = 3000;

    const blinkCycle = time % interval;
    if (blinkCycle > (interval - 200)) return 1;
    if (blinkCycle > (interval - 300) && blinkCycle < (interval - 250)) return 0.5;
    return 0;
  }
}
