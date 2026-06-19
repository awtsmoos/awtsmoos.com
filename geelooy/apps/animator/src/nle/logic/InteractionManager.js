
/* B”H */

/**
 * @class InteractionManager
 * @description
 * THE NULL-POINTER RECTIFICATION. 
 * This class now guards its 'Kelim' (vessels). It will not attempt 
 * to attach listeners if the manifest viewport is absent.
 */
export class InteractionManager {
  constructor(timeline) {
    this.timeline = timeline;
    this.activeClip = null;
  }

  init(viewport) {
    if (!viewport) {
      console.warn('B"H: NLE Viewport not yet manifest. Delaying interaction logic.');
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
    this.startX = e.clientX;
    this.timeline.selectClip(clip);
  }

  handleMove(e) {
    if (!this.activeClip) return;
    // Dragging logic...
  }

  handleUp() {
    this.activeClip = null;
  }
}
