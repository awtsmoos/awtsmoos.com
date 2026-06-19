
/* B”H */
import { HUDManager } from '../../ui/components/hud/HUDManager.js';

export class EditorPersistence {
  static save(state) {
    const charData = state.get('character');
    localStorage.setItem('park_character', JSON.stringify(charData));
    HUDManager.showMessage(state, 'Character Saved Local');
  }

  static load(state, onComplete) {
    const saved = localStorage.getItem('park_character');
    if (saved && saved !== 'undefined') {
      try {
        state.set('character', JSON.parse(saved));
        onComplete();
        HUDManager.showMessage(state, 'Character Loaded');
      } catch (err) {
        HUDManager.showMessage(state, 'Load Failed: Corrupt Data');
      }
    } else {
      HUDManager.showMessage(state, 'No Saved Character Found');
    }
  }
}
