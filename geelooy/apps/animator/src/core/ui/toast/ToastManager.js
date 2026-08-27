
// B"H
import { ToastState } from './ToastState.js';
import { ToastRenderer } from './ToastRenderer.js';
import { ToastTimer } from './ToastTimer.js';
import { HTMLGenerator } from '../../ui/HTMLGenerator.js';

/**
 * @class ToastManager
 * @description
 * THE WHISPERS OF TRUTH (Kol Demamah).
 * B"H
 * Replaces intrusive alert() boxes. Transient messages that slide into 
 * existence at the periphery of vision (Netzach/Hod) and vanish automatically.
 */
export class ToastManager {
  static container = null;

  static init() {
    this._ensureVessel();
  }

  static _ensureVessel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'awtsmoos-toast-mount';
      this.container.className = 'toast-mount-zone';
      document.body.appendChild(this.container);
    }
  }

  static notify(message, type = 'info', duration = 3000) {
    if (!this.container) this._ensureVessel();

    const id = `toast_${Date.now()}_${Math.random()}`;
    const toastData = { id, message, type };
    
    ToastState.add(toastData);
    this._render();

    ToastTimer.schedule(id, duration, () => {
      ToastState.remove(id);
      this._render();
    });
  }

  static _render() {
    if (!this.container) return;
    const schema = ToastRenderer.render(ToastState.getActive());
    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));
  }
}
