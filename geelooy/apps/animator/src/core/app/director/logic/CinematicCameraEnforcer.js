// B"H
import { MobileSafeFrameSolver } from '../../../../camera/framing/MobileSafeFrameSolver.js';
import { TargetResolver } from '../../../../camera/targets/TargetResolver.js';

/**
 * Last guardian before pixels: centers real targets, damps jitter, keeps fallback
 * shots alive, and lets no black wilderness swallow the actors.
 */
export class CinematicCameraEnforcer {
  static apply(camera = {}, event = {}, state) {
    const targets = this.targets(camera, event, state);
    const focus = this.focus(targets);
    const previous = state?.get?.('camera') || {};
    const desired = { ...camera, cameraId: camera.cameraId || event.cameraId || camera.shotType || 'auto', shot: camera.shot || camera.shotType || event.shot || 'mediumShot' };
    if (focus && !Number.isFinite(Number(event.x))) desired.x = this.mix(Number(previous.x ?? focus.x), focus.x, 0.55);
    if (!Number.isFinite(Number(desired.y))) desired.y = previous.y ?? 126;
    if (!Number.isFinite(Number(desired.zoom))) desired.zoom = previous.zoom ?? 0.94;
    desired.targetActors = camera.targetActors || targets.filter(t => t.type === 'actor').map(t => t.id);
    desired.targetProps = camera.targetProps || targets.filter(t => t.type === 'prop').map(t => t.id);
    desired.subtitle = camera.subtitle ?? true;
    return MobileSafeFrameSolver.solve(this.damp(previous, desired), state?.get?.('safeFrame') || { mobile: true });
  }

  static targets(camera, event, state) {
    if (camera.targets?.length) return camera.targets;
    return TargetResolver.resolve({ ...event, targets: event.targets || camera.targetActors || camera.targetProps }, state);
  }

  static focus(targets = []) {
    if (!targets.length) return null;
    return { x: targets.reduce((s, t) => s + Number(t.position?.x || 0), 0) / targets.length, y: targets.reduce((s, t) => s + Number(t.position?.y || 0), 0) / targets.length };
  }

  static damp(prev = {}, next = {}) {
    if (!Number.isFinite(Number(prev.zoom))) return next;
    return { ...next, x: this.mix(Number(prev.x || 0), Number(next.x || 0), 0.72), y: this.mix(Number(prev.y || 126), Number(next.y || 126), 0.66), zoom: this.mix(Number(prev.zoom || 0.94), Number(next.zoom || 0.94), 0.55) };
  }

  static mix(a, b, t) { return a + (b - a) * t; }
}
