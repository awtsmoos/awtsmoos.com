
// B"H

/**
 * @file DiegeticEditor.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 11: THE HAND OF THE CREATOR (Yad HaBoreh)
 * THE HIT-TEST COORDINATE RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "Reach your hand into the screen and drag the sun across the scene!"
 *
 * THE BUG OF THE WRONG COORDINATE SPACE:
 * The former DiegeticEditor computed sun screen-position using canvas.width
 * (the internal pixel resolution buffer, scaled by devicePixelRatio).
 * But mouse coordinates from events are in CSS display pixels.
 * On a Retina display (DPR=2), canvas.width is DOUBLE the display width.
 * This made the hit-target for the sun appear 2x further right than it
 * visually was — clicking on the sun did nothing, and clicking far to
 * the right of it would register as a sun-grab.
 *
 * THE POEM OF THE WRONG SUN:
 * The sun shone bright at display position eight hundred,
 * But canvas.width said sixteen hundred — the hit-test was shattered!
 * The user clicked the star, nothing happened at all,
 * They clicked a blank void and the sun began to fall!
 * Now clientWidth gives us the CSS coordinate true,
 * And the sun grabs correctly beneath the heavens blue!
 *
 * RECTIFICATION:
 * - Use canvas.clientWidth / canvas.clientHeight for ALL coordinate math.
 * - getBoundingClientRect() gives mouse coords in the same CSS pixel space.
 *
 * @class DiegeticEditor
 */
export class DiegeticEditor {
  /**
   * @static
   * @type {boolean}
   * @description Whether the user is currently dragging the sun.
   */
  static isGraspingSun = false;

  /**
   * @function bind
   * @description
   * Awakens the canvas to direct-manipulation interactions.
   * Binds mousedown, mousemove, mouseup, and touchstart/touchmove/touchend
   * so the Diegetic Editor works on both desktop and mobile.
   *
   * @param {HTMLCanvasElement} canvas - The physical canvas element.
   * @param {Object}            state  - The global universe StateManager.
   * @returns {void}
   */
  static bind(canvas, state) {
    if (!canvas) return;

    // ── Helper: get normalised mouse/touch position in CSS pixels ──
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const src  = e.touches ? e.touches[0] : e;
      return {
        x: src.clientX - rect.left,
        y: src.clientY - rect.top
      };
    };

    // ── Helper: calculate sun position in CSS pixels ──────────────
    const getSunPos = (scene) => {
      // CORRECTED: use clientWidth/clientHeight (CSS px) not canvas.width (buffer px)
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const timeOfDay = (scene && scene.timeOfDay !== undefined) ? scene.timeOfDay : 0.5;
      return {
        x: W * 0.8,
        y: (H * 0.2) + (timeOfDay * H * 0.5)
      };
    };

    // ── mousedown / touchstart ────────────────────────────────────
    const onDown = (e) => {
      const pos   = getPos(e);
      const scene = state.get('scene') || {};
      const sun   = getSunPos(scene);
      const dist  = Math.hypot(pos.x - sun.x, pos.y - sun.y);

      if (dist < 60) {
        this.isGraspingSun = true;
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    // ── mousemove / touchmove ─────────────────────────────────────
    const onMove = (e) => {
      if (!this.isGraspingSun) return;

      const pos = getPos(e);
      const H   = canvas.clientHeight;

      // Un-project Y coordinate back into timeOfDay (0.0 → 1.0)
      let newTime = (pos.y - (H * 0.2)) / (H * 0.5);
      newTime = Math.max(0.0, Math.min(1.0, newTime));

      const scene = { ...(state.get('scene') || {}), timeOfDay: newTime };
      state.set('scene', scene, true /* skip history for smooth drag */);

      e.preventDefault();
    };

    // ── mouseup / touchend ────────────────────────────────────────
    const onUp = () => {
      if (this.isGraspingSun) {
        this.isGraspingSun     = false;
        document.body.style.cursor = '';
      }
    };

    canvas.addEventListener('mousedown',  onDown, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });

    window.addEventListener('mousemove',  onMove, { passive: false });
    window.addEventListener('touchmove',  onMove, { passive: false });

    window.addEventListener('mouseup',  onUp);
    window.addEventListener('touchend', onUp);
  }
}
