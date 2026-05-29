// B"H
/**
 * CameraZoom binds the hamburger slider to the living canvas.
 *
 * The Awtsmoos makes vision itself a vessel: when the player drags the zoom
 * covenant, the whole canvas breathes larger or smaller, and the webcam bubble
 * breathes with it because it is painted inside the same world. No renderer
 * churn, no layout storm, only one CSS variable and one stored preference.
 */
export class CameraZoom {
  /**
   * @param {{canvas:HTMLCanvasElement, slider:HTMLInputElement, value:HTMLElement}} ui zoom nodes.
   */
  constructor(ui) {
    this.ui = ui;
    this.key = 'sulamHaSodCameraZoom';
  }

  /** Initializes the slider and applies the saved scale. */
  awaken() {
    const saved = Number(localStorage.getItem(this.key));
    const value = Number.isFinite(saved) ? saved : 1;
    this.set(value);
    this.ui.slider.addEventListener('input', () => this.set(Number(this.ui.slider.value)));
  }

  /**
   * Applies a zoom value to the canvas.
   * @param {number} raw requested scale from the slider.
   * @returns {number} clamped scale that was applied.
   */
  set(raw) {
    const zoom = Math.max(0.75, Math.min(1.55, raw || 1));
    this.ui.slider.value = String(zoom);
    this.ui.value.textContent = `${Math.round(zoom * 100)}%`;
    this.ui.canvas.style.setProperty('--camera-zoom', String(zoom));
    localStorage.setItem(this.key, String(zoom));
    return zoom;
  }
}
