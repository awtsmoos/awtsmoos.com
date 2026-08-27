// B"H

/**
 * Delete action for inspector panels.
 */
export class DeleteAction {
  /**
   * Renders a semantic delete button with no inline styles.
   *
   * @param {Object} event - Timeline event.
   * @param {Object} state - App state.
   * @param {Object} app - App core.
   * @returns {Object} HTMLGenerator schema.
   */
  static render(event, state, app) {
    return {
      tag: 'button',
      attr: { className: 'btn inspector-action inspector-delete' },
      children: 'ERASE FROM TIME',
      events: { click: () => this.erase(event, state, app) }
    };
  }

  /**
   * Removes one event from the active sequence and clears the inspector.
   *
   * @param {Object} event - Timeline event.
   * @param {Object} state - App state.
   * @param {Object} app - App core.
   * @returns {void}
   */
  static erase(event, state, app) {
    const seq = state.get('activeSequence');
    if (seq && seq.events) seq.events = seq.events.filter(item => item !== event);
    state.set('activeSequence', seq);
    if (app.timeline) app.timeline.refreshTracks();
    document.getElementById('prop-panel')?.classList.remove('visible');
    const mount = document.getElementById('inspector-mount');
    if (mount) mount.innerHTML = '<p class="inspector-empty">Vessel returned to Void.</p>';
  }
}
