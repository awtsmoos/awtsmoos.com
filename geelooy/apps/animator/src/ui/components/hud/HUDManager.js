
/* B”H */
import { HUDContainer } from './layout/HUDContainer.js';
import { HUDState } from './state/HUDState.js';

export class HUDManager {
  static render(state) {
    return HUDContainer.render(state);
  }

  static showMessage(state, text, duration = 2000) {
    HUDState.showMessage(state, text, duration);
  }

  static update(state) {
    const el = document.getElementById('hud-overlay');
    if (el) el.innerHTML = this.render(state);
  }
}
