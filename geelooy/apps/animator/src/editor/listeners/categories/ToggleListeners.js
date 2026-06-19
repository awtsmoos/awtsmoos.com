/* B”H */
export class ToggleListeners {
  static bind(editor) {
    const container = editor.container;
    if (!container) return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-key]');
      if (!btn) return;
      
      const key = btn.dataset.key;
      const value = btn.dataset.value === 'true';
      
      if (key.startsWith('v_') || key === 'flipX') {
        const char = editor.state.get('character');
        
        if (key.startsWith('v_')) {
          const layerId = key.replace('v_', '');
          if (!char.visibility) char.visibility = {};
          char.visibility[layerId] = value;
        } else {
          char[key] = value;
        }
        
        editor.state.set('character', char);
        editor.render();
      }
    });
  }
}
