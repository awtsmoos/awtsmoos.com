
// B"H
/**
 * @file ClipManipulator.js
 * @brief THE HAND OF TIME (Yad HaZman).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SHIFTING OF EPOCHS
 * ═══════════════════════════════════════════════════════════════
 * This class performs the sacred calculus of shifting an event's 
 * start and end times based on the physical pixel delta dragged by 
 * the user's mouse.
 * 
 * It automatically limits the movement to ensure a clip cannot be 
 * dragged before time zero (Tohu) or inverted (where end time becomes 
 * earlier than start time).
 * 
 * @class ClipManipulator
 */

import { MagneticSnap } from './MagneticSnap.js';

export class ClipManipulator {
  /**
   * @function evaluateDrag
   * @description Processes a timeline movement request.
   * @param {Object} dragState - The locked memory of the interaction.
   * @param {number} currentClientX - The live mouse position.
   * @param {Object} timelineCore - Provides pixelsToTime conversion.
   * @param {Object} activeSequence - Passed to magnetic snapping.
   * @returns {Object} { newStart, newEnd }
   */
  static evaluateDrag(dragState, currentClientX, timelineCore, activeSequence) {
    const pxDelta = currentClientX - dragState.startClientX;
    const msDelta = timelineCore.pixelsToTime(pxDelta);
    
    const duration = dragState.originalEndMs - dragState.originalStartMs;
    const pixelsPerSec = timelineCore.scaleFactor; // Extracted for snapping math

    if (dragState.interactionMode === 'move') {
      // Raw intent
      let rawStart = dragState.originalStartMs + msDelta;
      
      // Restrict from falling into the void before time zero
      if (rawStart < 0) rawStart = 0;

      // Apply the Magnetic Snap!
      const snappedStart = MagneticSnap.calculate(rawStart, activeSequence, dragState.activeEventId, pixelsPerSec);
      
      return { 
        start: snappedStart, 
        end: snappedStart + duration 
      };
    } 
    else if (dragState.interactionMode === 'resize-left') {
      let rawStart = dragState.originalStartMs + msDelta;
      if (rawStart < 0) rawStart = 0;
      
      // Prevent crushing the clip out of existence (min 100ms)
      if (rawStart > dragState.originalEndMs - 100) {
        rawStart = dragState.originalEndMs - 100;
      }

      const snappedStart = MagneticSnap.calculate(rawStart, activeSequence, dragState.activeEventId, pixelsPerSec);

      return { start: snappedStart, end: dragState.originalEndMs };
    }
    else if (dragState.interactionMode === 'resize-right') {
      let rawEnd = dragState.originalEndMs + msDelta;
      
      if (rawEnd < dragState.originalStartMs + 100) {
        rawEnd = dragState.originalStartMs + 100;
      }

      const snappedEnd = MagneticSnap.calculate(rawEnd, activeSequence, dragState.activeEventId, pixelsPerSec);

      return { start: dragState.originalStartMs, end: snappedEnd };
    }

    return { start: dragState.originalStartMs, end: dragState.originalEndMs };
  }
}
