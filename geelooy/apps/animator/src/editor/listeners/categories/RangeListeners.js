/* B”H */
export class RangeListeners {
  static bind(editor) {
    editor.container.querySelectorAll('input[type="range"]').forEach(input => input.addEventListener('input', () => { 
      const charData = editor.state.get('character'); 
      charData.mouthOpen = parseFloat(input.value); 
      editor.state.set('character', charData, true); 
    }));
  }
}
