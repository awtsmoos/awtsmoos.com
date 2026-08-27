// B"H

/**
 * @file OverlayProbe.js
 * @description Visual diagnostic for the current canonical shell only.
 */
export class OverlayProbe {
  /**
   * Installs visual outlines on active stage/chrome vessels.
   *
   * @returns {void}
   */
  static install() {
    const ids = ['hud-overlay', 'workspace-mount', 'nle-timeline', 'left-sidebar', 'right-sidebar', 'main-stage'];
    for (const id of ids) this.mark(id);
  }

  /**
   * Marks one overlay element without altering layout.
   *
   * @param {string} id - Element id.
   * @returns {void}
   */
  static mark(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    el.dataset.awOverlayProbe = [
      `z=${style.zIndex}`,
      `opacity=${style.opacity}`,
      `pe=${style.pointerEvents}`,
      `rect=${Math.round(rect.width)}x${Math.round(rect.height)}`
    ].join(' ');
    el.classList.add('aw-overlay-probed');
  }
}
