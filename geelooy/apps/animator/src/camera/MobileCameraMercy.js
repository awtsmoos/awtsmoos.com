// B"H
import { MobileSafeFrameSolver } from './framing/MobileSafeFrameSolver.js';

/** Compatibility wrapper plus cinematic mercy: old tests live, new shots rise. */
export class MobileCameraMercy {
  static normalize(safe = {}, cam = {}) {
    const kind = `${cam.shotType || cam.shot || cam.type || cam.framing || cam.cameraId || ''}`;
    const hinted = { ...cam, shotType: cam.shotType || cam.shot || this.shotType(kind) };
    return hinted.cinematicDirector ? this.cinematic(hinted, safe, kind) : this.legacy(hinted, safe, kind);
  }

  static cinematic(cam = {}, safe = {}, kind = '') {
    const close = /close|reaction|insert|face/i.test(kind);
    const two = /two|medium|dialogue/i.test(kind);
    const min = safe.mobile ? (close ? 1.9 : two ? 1.52 : 1.12) : (close ? 1.2 : 0.82);
    const max = safe.mobile ? (close ? 2.55 : 2.1) : 2.2;
    return {
      ...cam,
      x: this.clamp(Number(cam.x || 0), -360, 360),
      y: this.clamp(Number(cam.y ?? 48), -24, close ? 92 : 118),
      zoom: this.clamp(Number(cam.zoom || min), min, max)
    };
  }

  static legacy(hinted = {}, safe = {}, kind = '') {
    if (!Number.isFinite(Number(hinted.zoom))) hinted.zoom = this.defaultZoom(kind);
    if (!Number.isFinite(Number(hinted.y))) hinted.y = /wide|intro|group|establish/i.test(kind) ? 126 : 132;
    return MobileSafeFrameSolver.solve(hinted, safe);
  }

  static shotType(kind) {
    if (/wide|intro|group|master|establish/i.test(kind)) return 'wideShot';
    if (/close|face|reaction/i.test(kind)) return 'closeUp';
    if (/insert|prop|object|food/i.test(kind)) return 'objectInsert';
    if (/two|dialogue|conversation/i.test(kind)) return 'twoShot';
    return 'mediumShot';
  }

  static defaultZoom(kind) {
    if (/wide|intro|group|master|establish/i.test(kind)) return 0.72;
    if (/close|face|reaction/i.test(kind)) return 1.3;
    if (/insert|prop|object|food/i.test(kind)) return 1.35;
    if (/two|dialogue|conversation/i.test(kind)) return 1.1;
    return 0.94;
  }

  static clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
}
