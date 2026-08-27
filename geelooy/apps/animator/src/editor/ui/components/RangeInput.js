// B"H

/**
 * Range editor control with class-only structure.
 */
export class RangeInput {
  /**
   * Renders a range slider for mouth openness.
   *
   * @param {Object} editor - Editor manager.
   * @param {string} key - Setting key.
   * @param {Object} config - Range config.
   * @returns {string} HTML string.
   */
  static render(editor, key, config) {
    const val = editor.state.get('character').mouthOpen || 0;
    return `
      <div class="range-control">
        <input type="range" data-key="${key}" min="${config.min}" max="${config.max}" step="${config.step}" value="${val}" class="range-input">
        <div class="range-label-row">
          <span>Closed</span><span>Wide Open</span>
        </div>
      </div>
    `;
  }
}
