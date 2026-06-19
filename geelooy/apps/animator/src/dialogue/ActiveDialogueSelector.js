// B"H

/**
 * @file ActiveDialogueSelector.js
 * @description
 * Gets the current dialogue line from state.
 */
export class ActiveDialogueSelector {
  /**
   * Selects active dialogue.
   *
   * @param {Object} state - App state.
   * @returns {Object|null} Active dialogue.
   */
  static select(state) {
    const active = state.get('activeDialogue');
    if (!active || !active.text) return null;
    return active;
  }
}