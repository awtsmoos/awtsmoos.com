
/* B”H */

/**
 * @class InteractionManager
 * @description
 * RECTIFIED. This manager now checks for the existence of its vessels 
 * before attaching listeners, preventing the 'Cannot read properties of null' 
 * collapse.
 */
export class InteractionManager {
  constructor(timeline) {
    this.timeline = timeline;
    this.activeClip = null;
  }

  init(viewport) {
    if (!viewport) {
      console.warn("B\"H: Timeline viewport is absent. Retrying emanation.");
      return;
    }

    viewport.addEventListener('mousedown', (e) => this.handleDown(e));
    window.addEventListener('mousemove', (e) => this.handleMove(e));
    window.addEventListener('mouseup', () => this.handleUp());
  }

  handleDown(e) {
    const clip = e.target.closest('.nle-clip');
    if (!clip) return;
    this.activeClip = clip;
    this.timeline.selectClip(clip);
  }

  handleMove(e) {
    if (!this.activeClip) return;
    // Interaction logic...
  }

  handleUp() {
    this.activeClip = null;
  }
}
