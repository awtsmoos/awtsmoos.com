
/* B”H */

/**
 * @class SelectionManager
 * @description
 * The 'Daat' (Knowledge) of Selection.
 * Connects the physical entities in the viewport to their clips in the NLE.
 * Clicking anything in the scene manifests its properties in the inspector.
 */
export class SelectionManager {
  constructor(app) {
    this.app = app;
    this.selectedId = null;
  }

  select(id) {
    this.selectedId = id;
    this.app.state.set('selected_entity_id', id);
    // Notify NLE to highlight relevant track/clips
    window.dispatchEvent(new CustomEvent('nle-selection-changed', { detail: { id } }));
  }
}
