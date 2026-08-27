/* B”H */
export class TabListeners {
  static bind(editor) {
    editor.container.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => { 
      editor.activeTab = btn.dataset.tab; 
      editor.render(); 
    }));
  }
}
