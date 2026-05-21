/**
 * B"H
 * Chapter 31: The Sun Turned Like A Golden Key.
 */

export class DayNightRuntime {
  constructor(minutes = 360) {
    this.minutes = minutes;
  }

  advance(deltaMinutes) {
    this.minutes = (this.minutes + deltaMinutes) % 1440;
    return this.phase();
  }

  phase() {
    if (this.minutes < 300) return 'night';
    if (this.minutes < 420) return 'dawn';
    if (this.minutes < 1080) return 'day';
    if (this.minutes < 1200) return 'dusk';
    return 'night';
  }

  snapshot() {
    return { minutes: this.minutes, phase: this.phase() };
  }
}

export default DayNightRuntime;
