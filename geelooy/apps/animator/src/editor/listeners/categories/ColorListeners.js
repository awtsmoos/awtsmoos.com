
// B"H
export class ColorListeners {
  static bind(editor) {
    editor.container.querySelectorAll('.swatch').forEach(btn => btn.addEventListener('click', () => { 
      const charData = editor.state.get('character'); 
      const key = btn.dataset.key;
      
      // Special route mapping for sub-object properties
      if (key === 'shirtColor') charData.colors.shirt = btn.dataset.value;
      else if (key === 'pantsColor') charData.colors.pants = btn.dataset.value;
      else charData.colors[key] = btn.dataset.value; 
      
      editor.state.set('character', charData); 
      editor.render(); 
    }));
  }
}
