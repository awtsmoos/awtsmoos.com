/* B”H */
export class EditorRandomizer {
  static randomize(editor) {
    const charData = editor.state.get('character');
    for (const [key, config] of Object.entries(editor.partsData)) {
      if (!config.options) continue;
      const randomOption = config.options[Math.floor(Math.random() * config.options.length)];
      if (config.type === 'color') {
        charData.colors[key] = randomOption;
      } else if (config.type === 'select') {
        charData[key] = randomOption.id;
      }
    }
    charData.mouthOpen = Math.random() * 0.5;
    editor.state.set('character', charData);
    editor.render();
  }
}
