
// B"H
import { ContextMenuState } from './ContextMenuState.js';
import { ContextMenuRenderer } from './ContextMenuRenderer.js';
import { HTMLGenerator } from '../../../core/ui/HTMLGenerator.js';

/**
 * @class ContextMenuManager
 * @description
 * THE ORACLE OF DECISION (Sha'ar HaKachlatah).
 */
export class ContextMenuManager {
  static container = null;

  static init(appState, appCore) {
    this.appState = appState;
    this.appCore = appCore;
    this._ensureVessel();
    this._bindGlobal();
  }

  static _ensureVessel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'awtsmoos-context-menu';
      this.container.className = 'awtsmoos-context-menu hidden';
      document.body.appendChild(this.container);
    }
  }

  static _bindGlobal() {
    document.addEventListener('contextmenu', (e) => {
      const menuType = e.target.closest('[data-context-type]')?.getAttribute('data-context-type');
      
      if (menuType) {
        e.preventDefault();
        ContextMenuState.targetType = menuType;
        ContextMenuState.targetId = e.target.closest('[data-context-id]')?.getAttribute('data-context-id');
        
        // B"H - Capture the full JSON essence of the clip!
        const rawData = e.target.closest('[data-event-data]')?.getAttribute('data-event-data');
        if (rawData) {
          try {
            ContextMenuState.targetEventData = JSON.parse(decodeURIComponent(rawData));
          } catch (err) {
            console.warn('B"H - ContextMenu failed to decode spark essence.', err);
          }
        }

        this.show(e.clientX, e.clientY);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#awtsmoos-context-menu')) {
        this.hide();
      }
    });
  }

  static show(x, y) {
    if (!this.container) return;
    const schema = ContextMenuRenderer.render(ContextMenuState.targetType, this.appState, this.appCore);
    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));

    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
    this.container.classList.remove('hidden');
  }

  static hide() {
    if (this.container) this.container.classList.add('hidden');
  }
}
