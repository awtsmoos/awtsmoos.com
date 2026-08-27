
/* B”H */

/**
 * @class CinematicCamera
 * @description
 * The Eye of the Director. 
 * Now supports 'Hard Cuts' and 'Subject Tracking'.
 * The camera can instantly snap to a new subject or perform 
 * complex zoom-and-pan maneuvers to emphasize the drama.
 */
export class CinematicCamera {
  constructor(state) {
    this.state = state;
  }

  /**
   * Performs a 'Hard Cut' to a specific subject.
   */
  cutTo(x, y, zoom) {
    this.state.update('camera', { x, y, zoom });
  }

  /**
   * Tracks a character, centering them in the frame.
   */
  trackSubject(charId, zoom) {
    const chars = this.state.get('characters');
    if (chars[charId]) {
      const pos = chars[charId].position;
      this.state.update('camera', { x: pos.x, y: pos.y - 100, zoom });
    }
  }
}
