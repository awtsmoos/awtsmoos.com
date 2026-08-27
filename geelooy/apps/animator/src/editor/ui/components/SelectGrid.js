// B"H

/**
 * Select grid renderer with class-only presentation.
 */
export class SelectGrid {
  /**
   * Renders selectable options.
   *
   * @param {Object} editor - Editor manager.
   * @param {string} key - Setting key.
   * @param {Object} config - Select config.
   * @returns {string} HTML string.
   */
  static render(editor, key, config) {
    const active = editor.state.get('character')[key];
    const buttons = config.options.map(option => {
      const isActive = active === option.id;
      return `<button data-key="${key}" data-value="${option.id}" class="btn select-grid-btn ${isActive ? 'btn-primary' : ''}">${option.label}</button>`;
    }).join('');

    return `<div class="select-grid">${buttons}</div>`;
  }
}
