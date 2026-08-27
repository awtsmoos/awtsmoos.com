// B"H

/**
 * Color swatch renderer with no inline style leakage.
 */
export class ColorGrid {
  /**
   * Renders color choices using deterministic color classes.
   *
   * @param {Object} editor - Editor manager.
   * @param {string} key - Character color key.
   * @param {Object} config - Color config.
   * @returns {string} HTML string.
   */
  static render(editor, key, config) {
    const colors = editor.state.get('character').colors || {};
    const activeColor = colors[key];
    const buttons = config.options.map(color => this.button(key, color, activeColor === color)).join('');
    return `<div class="swatch-grid">${buttons}</div>`;
  }

  /**
   * Builds one swatch button.
   *
   * @param {string} key - Character color key.
   * @param {string} color - Hex color value.
   * @param {boolean} active - Active state.
   * @returns {string} HTML string.
   */
  static button(key, color, active) {
    const colorClass = `swatch-color-${String(color).replace('#', '').toLowerCase()}`;
    return `<button data-key="${key}" data-value="${color}" class="swatch ${colorClass} ${active ? 'active' : ''}" aria-label="${key} ${color}"></button>`;
  }
}
