
/* B”H */

/**
 * @class PositionModifier
 * @description
 * Modifies the 'Makom' (Place) of a clip in the timeline. 
 * Ensures that as you drag a clip, the causality of the sequence is preserved.
 */
export class PositionModifier {
  static move(event, deltaMs, duration) {
    const len = event.end - event.start;
    event.start = Math.max(0, Math.min(duration - len, event.start + deltaMs));
    event.end = event.start + len;
  }
}
