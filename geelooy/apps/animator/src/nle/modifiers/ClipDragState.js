
// B"H
/**
 * @file ClipDragState.js
 * @brief THE MEMORY OF SHIFTING TIME (Zikaron HaNayad).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BURDEN OF THE TIMELINE
 * ═══════════════════════════════════════════════════════════════
 * When the user clicks a clip to move it, we must remember its exact 
 * original chronological start time, its duration, and where the mouse 
 * grabbed it. 
 * 
 * If we do not store this, the clip will jitter violently or teleport 
 * incorrectly due to relative coordinate drift. This pure data class 
 * locks the temporal variables in place during the duration of the drag.
 * 
 * @class ClipDragState
 */
export class ClipDragState {
  static isDragging = false;
  static activeClipElement = null;
  static activeEventId = null;
  
  /** @type {string} 'move', 'resize-left', 'resize-right' */
  static interactionMode = 'move';
  
  static originalStartMs = 0;
  static originalEndMs = 0;
  
  /** @type {number} The absolute mouse X when the click originated */
  static startClientX = 0;

  static reset() {
    this.isDragging = false;
    this.activeClipElement = null;
    this.activeEventId = null;
    this.interactionMode = 'move';
    this.originalStartMs = 0;
    this.originalEndMs = 0;
    this.startClientX = 0;
  }
}
