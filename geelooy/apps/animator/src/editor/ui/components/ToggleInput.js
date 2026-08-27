// B"H

/**
 * Boolean editor control with class-only presentation.
 */
export class ToggleInput {
  /**
   * Renders an ON/OFF button.
   *
   * @param {Object} editor - Editor manager.
   * @param {string} key - Setting key.
   * @returns {string} HTML string.
   */
  static render(editor, key) {
    const char = editor.state.get('character');
    const isActive = this.isActive(char, key);
    return `
      <button data-key="${key}" data-value="${!isActive}" class="btn toggle-btn ${isActive ? 'btn-primary' : ''}">
        ${isActive ? 'ON' : 'OFF'}
      </button>
    `;
  }

  /**
   * Resolves active state for ordinary keys and visibility layer keys.
   *
   * @param {Object} char - Character data.
   * @param {string} key - Setting key.
   * @returns {boolean} Active state.
   */
  static isActive(char, key) {
    if (key.startsWith('v_')) {
      const layerId = key.replace('v_', '');
      return char.visibility ? char.visibility[layerId] !== false : true;
    }

    return !!char[key];
  }
}
