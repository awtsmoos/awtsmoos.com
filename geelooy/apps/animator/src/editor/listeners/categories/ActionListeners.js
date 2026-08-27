
/* B”H */
import { HUDManager } from '../../../ui/components/hud/HUDManager.js';

export class ActionListeners {
  static bind(editor) {
    const randBtn = document.getElementById('randomize-btn');
    if (randBtn) randBtn.addEventListener('click', () => {
        import('../../core/EditorRandomizer.js').then(({ EditorRandomizer }) => EditorRandomizer.randomize(editor));
    });

    const mouthBtn = document.getElementById('mouth-architect-btn');
    if (mouthBtn) mouthBtn.addEventListener('click', () => {
      const mouthPanel = document.getElementById('mouth-editor-container');
      if (mouthPanel) {
        const isHidden = mouthPanel.style.display === 'none';
        mouthPanel.style.display = isHidden ? 'block' : 'none';
      }
    });

    const keyBtn = document.getElementById('keyframe-btn');
    if (keyBtn) keyBtn.addEventListener('click', () => {
      const charData = editor.state.get('character');
      if (editor.app && editor.app.timeline) {
        editor.app.timeline.addKeyframe('main', { ...charData });
        HUDManager.showMessage(editor.state, 'Keyframe Added');
      }
    });
    
    const expBtn = document.getElementById('export-btn');
    if (expBtn) expBtn.addEventListener('click', () => {
      const data = editor.state.get('character');
      console.log('Character Data:', data);
      HUDManager.showMessage(editor.state, 'Character Data Logged');
    });
  }
}
