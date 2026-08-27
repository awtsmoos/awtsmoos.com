
// B"H
import { StageSafeArea } from '../stage/StageSafeArea.js';

/**
 * @file ScreenCameraDirector.js
 * @description
 * ============================================================================
 * CHAPTER: THE CINEMATOGRAPHER WHO FINALLY FRAMED THE ACTORS
 * ============================================================================
 *
 * This camera is for the current direct-canvas rescue path. It frames the
 * visible humans by real screen dimensions, not by stale actor-plane transforms.
 * It supports shot intent, breathing motion, subject centering, and safe mobile
 * bottom constraints.
 *
 * @module ScreenCameraDirector
 */

/**
 * @class ScreenCameraDirector
 * @description
 * Computes direct-canvas layout and shot framing for the emergency renderer.
 */
export class ScreenCameraDirector {
  /**
   * Computes a screen camera frame.
   *
   * @param {Object} app - App instance.
   * @param {Array<Array<string,Object>>} entries - Character entries.
   * @param {number} time - Render time.
   * @returns {Object} Camera/layout data.
   */
  static frame(app, entries = [], time = performance.now()) {
    const safe = StageSafeArea.resolve(app);
    const count = Math.max(1, entries.length);
    const selected = app?.state?.get ? app.state.get('selected_entity_id') : null;
    const shot = this.shotName(app, count);
    const shotScale = this.shotScale(shot, count, safe);
    const maxPerRow = this.maxPerRow(shot, count, safe);
    const spacing = this.spacing(shot, maxPerRow, safe, shotScale);
    const rows = Math.ceil(count / maxPerRow);
    const groundBase = safe.actorGroundY - Math.max(0, rows - 1) * 42 * shotScale;
    const breathing = Math.sin(time * 0.0007) * 4;

    return {
      safe,
      shot,
      selected,
      scale: shotScale,
      maxPerRow,
      spacing,
      rows,
      groundBase: groundBase + breathing,
      centerX: safe.centerX,
      parallaxX: Math.sin(time * 0.00018) * safe.width * 0.012,
      drift: Math.sin(time * 0.00042) * 8
    };
  }

  /**
   * Determines shot name.
   *
   * @param {Object} app - App.
   * @param {number} count - Character count.
   * @returns {string} Shot name.
   */
  static shotName(app, count) {
    const stateShot = app?.state?.get ? app.state.get('screen_camera_shot') : null;
    if (stateShot) return stateShot;
    if (count <= 1) return 'mediumFull';
    if (count <= 3) return 'threeShot';
    return 'group';
  }

  /**
   * Resolves actor scale for a shot.
   *
   * @param {string} shot - Shot name.
   * @param {number} count - Character count.
   * @param {Object} safe - Safe frame.
   * @returns {number} Scale.
   */
  static shotScale(shot, count, safe) {
    const map = {
      wide: 0.78,
      group: count > 5 ? 0.86 : 0.94,
      threeShot: 1.05,
      fullBody: 1.15,
      mediumFull: 1.28,
      medium: 1.45,
      closeUp: 1.8
    };
    const base = map[shot] || map.group;
    const fit = Math.max(0.72, Math.min(1.55, safe.stageHeight / 820));
    return Math.max(0.68, Math.min(1.7, base * fit));
  }

  /**
   * Resolves characters per row.
   *
   * @param {string} shot - Shot name.
   * @param {number} count - Count.
   * @param {Object} safe - Safe frame.
   * @returns {number} Per row.
   */
  static maxPerRow(shot, count, safe) {
    if (shot === 'mediumFull' || shot === 'medium') return 1;
    if (shot === 'threeShot') return Math.min(3, count);
    const byWidth = Math.max(2, Math.floor(safe.width / 230));
    return Math.max(2, Math.min(6, byWidth, count));
  }

  /**
   * Computes spacing.
   *
   * @param {string} shot - Shot.
   * @param {number} maxPerRow - Per row.
   * @param {Object} safe - Safe.
   * @param {number} scale - Scale.
   * @returns {number} Spacing.
   */
  static spacing(shot, maxPerRow, safe, scale) {
    if (maxPerRow <= 1) return 0;
    const ideal = 132 * scale;
    const fit = safe.width * 0.82 / Math.max(1, maxPerRow - 1);
    return Math.max(92 * scale, Math.min(ideal, fit));
  }

  /**
   * Computes position for one actor.
   *
   * @param {Object} camera - Camera data.
   * @param {number} index - Character index.
   * @returns {Object} Position.
   */
  static actorPosition(camera, index) {
    const row = Math.floor(index / camera.maxPerRow);
    const col = index % camera.maxPerRow;
    const rowCount = row === camera.rows - 1
      ? Math.max(1, ((index + 1) % camera.maxPerRow) || camera.maxPerRow)
      : camera.maxPerRow;
    const rowStart = camera.centerX - (rowCount - 1) * camera.spacing * 0.5;
    const x = rowStart + Math.min(col, rowCount - 1) * camera.spacing;
    const y = camera.groundBase - row * 78 * camera.scale;
    return { x, y, row, col };
  }
}
