
// B"H
import { DebugFlags } from './DebugFlags.js';
import { BootVisualSentinel } from './BootVisualSentinel.js';
import { FrameProbeOverlay } from './FrameProbeOverlay.js';
import { CameraProbe } from './CameraProbe.js';
import { OverlayProbe } from './OverlayProbe.js';
import { HitRegionProbe } from './HitRegionProbe.js';
import { RenderInvariantProbe } from './RenderInvariantProbe.js';

/**
 * @file DebugSystem.js
 * @description
 * ============================================================================
 * CHAPTER: THE MANY LAMPS BECAME ONE MENORAH
 * ============================================================================
 *
 * Debugging should not be scattered. This system gathers the boot flame, frame
 * heartbeat, camera safe lines, overlay confession, and hit-region outlines.
 *
 * @module DebugSystem
 */

/**
 * @class DebugSystem
 * @description
 * Unified debug instrumentation.
 */
export class DebugSystem {
  /**
   * Installs boot diagnostics.
   *
   * @param {Object} app - App object.
   * @returns {Object} Flags.
   */
  static install(app) {
    const flags = DebugFlags.read();
    if (flags.overlays) OverlayProbe.install();
    if (flags.boot && app && app.ctx) BootVisualSentinel.paint(app.ctx);
    if (app && app.state && app.state.set) app.state.set('debug_flags', flags);
    return flags;
  }

  /**
   * Paints post-render diagnostics.
   *
   * @param {Object} app - App object.
   * @param {Object} info - Render info.
   * @returns {void}
   */
  static afterRender(app, info = {}) {
    if (!app || !app.ctx || !app.ctx.ctx || !app.state) return;
    const flags = app.state.get ? app.state.get('debug_flags') || DebugFlags.read() : DebugFlags.read();
    const ctx = app.ctx.ctx;
    if (flags.camera) CameraProbe.paint(ctx, app.ctx);
    if (flags.hit) HitRegionProbe.paint(ctx, app.state.get('hit_regions') || [], app.state.get('selected_entity_id'));
    RenderInvariantProbe.record(app, info);
    RenderInvariantProbe.record(app, info);
    if (flags.frame) FrameProbeOverlay.paint(ctx, app, info);
  }
}
