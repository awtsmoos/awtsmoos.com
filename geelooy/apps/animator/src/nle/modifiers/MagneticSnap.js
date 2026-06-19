
// B"H
/**
 * @file MagneticSnap.js
 * @brief THE ATTRACTION OF SOULS (Hitkashrut HaZman).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE REJECTION OF THE VOID
 * ═══════════════════════════════════════════════════════════════
 * Time is continuous. If an editor drags a speech clip and leaves a 
 * 3-millisecond gap before the camera cuts, the universe stutters.
 * 
 * Magnetic Snapping enforces the flow of destiny. As the user's cursor 
 * nears the edge of another clip, or a 1-second grid boundary, the 
 * mathematical force pulls the dragged clip perfectly flush against it, 
 * sealing the tear in the timeline.
 * 
 * @class MagneticSnap
 */

export class MagneticSnap {
  /**
   * @function calculate
   * @description Finds the optimal chronological anchor point for a dragged time value.
   * @param {number} rawMs - The un-snapped millisecond value from the mouse.
   * @param {Object} activeSequence - The script of all existence.
   * @param {string} excludeId - The ID of the clip currently being dragged (don't snap to self).
   * @param {number} pixelsPerSecond - The current zoom scale factor of the timeline.
   * @returns {number} The perfectly snapped millisecond value.
   */
  static calculate(rawMs, activeSequence, excludeId, pixelsPerSecond) {
    if (!activeSequence || !activeSequence.events) return rawMs;

    let bestSnap = rawMs;
    // Tzimtzum: The magnetic field only extends 15 pixels in physical screen space.
    // We must convert 15 physical pixels into chronological milliseconds!
    const msPerPixel = 1000 / pixelsPerSecond;
    let minDistanceMs = 15 * msPerPixel; 

    // 1. GRID SNAPPING (Every 1000ms / 1 second)
    const gridInterval = 1000;
    const remainder = rawMs % gridInterval;
    const nearestGrid = (remainder < gridInterval / 2) 
      ? rawMs - remainder 
      : rawMs + (gridInterval - remainder);

    if (Math.abs(nearestGrid - rawMs) < minDistanceMs) {
      bestSnap = nearestGrid;
      minDistanceMs = Math.abs(nearestGrid - rawMs);
    }

    // 2. CLIP EDGE SNAPPING (Seek other sparks of action)
    activeSequence.events.forEach(e => {
      if (e.id === excludeId) return; // Prevent recursive self-collapse
      
      const diffStart = Math.abs(e.start - rawMs);
      const diffEnd = Math.abs(e.end - rawMs);

      // Does the dragged edge touch the START of another clip?
      if (diffStart < minDistanceMs) {
        minDistanceMs = diffStart;
        bestSnap = e.start;
      }
      
      // Does the dragged edge touch the END of another clip?
      if (diffEnd < minDistanceMs) {
        minDistanceMs = diffEnd;
        bestSnap = e.end;
      }
    });

    return bestSnap;
  }
}
