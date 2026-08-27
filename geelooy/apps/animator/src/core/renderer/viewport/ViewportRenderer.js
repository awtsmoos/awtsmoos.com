
/**
 * @file ViewportRenderer.js
 * @description
 * THE BRINGER OF FORM (HaMetzayer).
 */

export class ViewportRenderer {
  constructor(state) {
    this.state = state;
  }

  setupDOM() {
    const stage = document.getElementById(this.state.stageId);
    if (!stage) {
      requestAnimationFrame(() => this.setupDOM());
      return;
    }

    this.state.stage = stage;
    stage.appendChild(this.state.container);
    this.state.container.appendChild(this.state.canvas);
    
    this.state.container.style.position = 'absolute';
    this.state.canvas.style.display = 'block';
    this.fitToScreen();
  }

  updateResolution(w, h) {
    this.state.internalW = w;
    this.state.internalH = h;
    this.state.canvas.width = w;
    this.state.canvas.height = h;
    this.fitToScreen();
  }

  fitToScreen() {
    if (!this.state.stage) return;
    
    const rect = this.state.stage.getBoundingClientRect();
    const sw = rect.width;
    const sh = rect.height;

    // B"H - Perfect aspect ratio fit without squashing
    const scaleX = sw / this.state.internalW;
    const scaleY = sh / this.state.internalH;
    
    this.state.baseScale = Math.min(scaleX, scaleY);
    this.applyTransform();
  }

  applyTransform() {
    const s = this.state.baseScale * this.state.zoom;
    const px = this.state.pan.x;
    const py = this.state.pan.y;
    
    this.state.container.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${s})`;
    this.state.container.style.left = '50%';
    this.state.container.style.top = '50%';
    this.state.container.style.transformOrigin = 'center center';
  }
}
