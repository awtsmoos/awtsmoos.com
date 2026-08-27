
// B"H
import { LassoState } from './LassoState.js';

export class LassoRenderer {
  static box = null;

  static ensureVessel(parent) {
    if (!this.box) {
      this.box = document.createElement('div');
      this.box.className = 'nle-lasso-box hidden';
      parent.appendChild(this.box);
    }
  }

  static draw() {
    if (!this.box) return;
    this.box.classList.remove('hidden');

    const x = Math.min(LassoState.startX, LassoState.currentX);
    const y = Math.min(LassoState.startY, LassoState.currentY);
    const w = Math.abs(LassoState.startX - LassoState.currentX);
    const h = Math.abs(LassoState.startY - LassoState.currentY);

    this.box.style.left = `${x}px`;
    this.box.style.top = `${y}px`;
    this.box.style.width = `${w}px`;
    this.box.style.height = `${h}px`;
  }

  static hide() {
    if (this.box) this.box.classList.add('hidden');
  }
}
