
/* B”H */
export class TimeModifier {
  static resize(event, deltaMs, side, duration) {
    if (side === 'left') {
      event.start = Math.max(0, Math.min(event.end - 100, event.start + deltaMs));
    } else {
      event.end = Math.max(event.start + 100, Math.min(duration, event.end + deltaMs));
    }
  }
}
