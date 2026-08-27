
/* B”H */

/**
 * @class ViewportInteractions
 * @description
 * THE HAND OF THE CREATOR (Yad Hashem).
 * Binds the physical input of the user (mouse, touch) into the infinite void,
 * allowing panning across eternity and zooming into the microscopic atoms of the Awtsmoos.
 */
export class ViewportInteractions {
  constructor(state, renderer) {
    this.state = state;
    this.renderer = renderer;
  }

  /**
   * Awakens the event listeners that track human intention.
   */
  bindEvents() {
    if (!this.state.stage) return;
    
    let dragging = false;
    let start = { x: 0, y: 0 };

    this.state.stage.addEventListener('mousedown', (e) => {
      // Prevent interference with the floating panels of UI
      if (e.target.closest('.workspace-overlay') || e.target.closest('.ui-visibility-toggle')) return;
      dragging = true;
      start = { x: e.clientX - this.state.pan.x, y: e.clientY - this.state.pan.y };
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      this.state.pan.x = e.clientX - start.x;
      this.state.pan.y = e.clientY - start.y;
      this.renderer.applyTransform();
    });

    window.addEventListener('mouseup', () => dragging = false);

    this.state.stage.addEventListener('wheel', (e) => {
      if (e.target.closest('.workspace-overlay') || e.target.closest('.properties-panel')) return;
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      this.state.zoom = Math.max(0.1, Math.min(10, this.state.zoom + delta));
      this.renderer.applyTransform();
    }, { passive: false });
  }
}
