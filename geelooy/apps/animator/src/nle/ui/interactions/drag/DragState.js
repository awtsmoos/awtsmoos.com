
// B"H
export class DragState {
  static isDragging = false;
  static ghostClip = null;
  static originalClip = null;
  static eventData = null;
  static startX = 0;
  static timeTooltip = null;

  static reset() {
    this.isDragging = false;
    this.ghostClip = null;
    this.originalClip = null;
    this.eventData = null;
    this.startX = 0;
    this.timeTooltip = null;
  }
}
