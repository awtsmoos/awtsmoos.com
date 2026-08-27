/* B”H */
export class SelectListeners {
  static bind(editor) {
    editor.container.querySelectorAll('.btn[data-key]').forEach(btn => btn.addEventListener('click', () => { 
      const charData = editor.state.get('character'); 
      const key = btn.dataset.key;
      const val = btn.dataset.value;

      if (key.startsWith('v_')) {
        const layerId = key.replace('v_', '');
        if (!charData.visibility) charData.visibility = {};
        charData.visibility[layerId] = val === 'true';
      } else {
        charData[key] = (val === 'true') ? true : (val === 'false' ? false : val);
      }
      
      editor.state.set('character', charData, true); 
      editor.render(); 
    }));
  }
}
