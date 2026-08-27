// B"H
/**
 * @file LassoBoundsMath.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE NET OF GATHERING (Reshet Kibbutz)
 * THE COORDINATE SPACE RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * THE POEM OF THE OFFSET ABYSS:
 * offsetTop said "I know where the clip sits!",
 * But it lied — it only knew its parent's bits!
 * In a nested scroll, three containers deep,
 * The Y coordinate fell into the void of sleep.
 * The lasso selected the wrong sparks every time,
 * Missing the true clips — a geometry crime!
 * Now getBoundingClientRect() speaks the absolute truth,
 * And the viewport rect anchors the proof!
 * Every clip is found at its true CSS place,
 * The net of gathering covers all of space!
 *
 * RECTIFICATION:
 * Use getBoundingClientRect() for all coordinate math.
 * The viewport's own rect is subtracted to normalize into local space.
 * Scroll offset is added back to account for panned timelines.
 * This is correct in ANY nesting depth.
 *
 * @module LassoBoundsMath
 */
export class LassoBoundsMath {
  /**
   * @function findIntersections
   * @description
   * Finds all `.nle-clip` elements whose bounding boxes intersect with the
   * current lasso selection rectangle. Uses getBoundingClientRect() for
   * accurate coordinate resolution at any DOM nesting depth.
   *
   * "And Jacob stretched out his hand and caught hold of Esau's heel."
   * — Bereishis 25:26. This function reaches into the DOM and grasps
   * exactly the right sparks — no more, no less.
   *
   * @param {Object}      state    - The LassoState with startX/Y, currentX/Y.
   * @param {HTMLElement} viewport - The scrollable timeline viewport element.
   * @returns {Array<string>} Array of clip data-id values within the selection.
   */
  static findIntersections(state, viewport) {
    if (!viewport) return [];

    // The lasso bounds in viewport-local scroll coordinates
    const x1 = Math.min(state.startX,   state.currentX);
    const x2 = Math.max(state.startX,   state.currentX);
    const y1 = Math.min(state.startY,   state.currentY);
    const y2 = Math.max(state.startY,   state.currentY);

    // The viewport's position in screen CSS pixels — our reference frame
    const vpRect = viewport.getBoundingClientRect();

    const clips    = viewport.querySelectorAll('.nle-clip');
    const selected = [];

    clips.forEach(clip => {
      // B"H - RECTIFICATION: getBoundingClientRect() is accurate at any depth.
      // We subtract the viewport rect and add scroll to convert to
      // the same coordinate space that LassoState uses.
      const clipRect = clip.getBoundingClientRect();

      const cx1 = clipRect.left   - vpRect.left  + viewport.scrollLeft;
      const cx2 = clipRect.right  - vpRect.left  + viewport.scrollLeft;
      const cy1 = clipRect.top    - vpRect.top   + viewport.scrollTop;
      const cy2 = clipRect.bottom - vpRect.top   + viewport.scrollTop;

      // AABB intersection test
      if (x1 < cx2 && x2 > cx1 && y1 < cy2 && y2 > cy1) {
        clip.classList.add('selected');
        selected.push(clip.dataset.id);
      }
    });

    return selected;
  }
}