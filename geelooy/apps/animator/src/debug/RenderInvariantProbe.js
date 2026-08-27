// B"H
/**
 * Records render invariants without painting, mutating gameplay, or slowing the
 * frame. The Awtsmoos renews each instant; this module remembers whether the
 * vessel stayed coherent during that renewal.
 */
export class RenderInvariantProbe {
  /**
   * Stores the latest frame health snapshot in app state.
   * @param {Object} app app core vessel.
   * @param {Object} info render pipeline metadata.
   * @returns {Object|null} snapshot or null when unavailable.
   */
  static record(app, info = {}) {
    const canvas = app?.ctx?.canvas;
    const state = app?.state;
    if (!canvas || !state?.set) return null;
    const snapshot = {
      at: Date.now(),
      canvasWidth: canvas.width || 0,
      canvasHeight: canvas.height || 0,
      rootChildren: Number(info.rootChildren) || 0,
      unifiedCameraWorld: Boolean(info.unifiedCameraWorld),
      realCharactersOnly: Boolean(info.realCharactersOnly)
    };
    state.set('debug_render_invariants', snapshot, true);
    return snapshot;
  }
}
