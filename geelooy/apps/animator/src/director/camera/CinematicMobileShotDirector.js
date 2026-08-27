// B"H
import { SafeFrameResolver } from '../../camera/SafeFrameResolver.js';

/** Converts an automatic story plan into a camera that refuses museum distance. */
export class CinematicMobileShotDirector {
  static resolve(ctx = {}, state = null, cam = {}, plan = null) {
    const safe = SafeFrameResolver.resolve(ctx);
    const scene = state?.get ? state.get('scene') || {} : {};
    const warm = /goal_board|warm_study|production|scholar/i.test(`${scene.style || ''}`);
    if (!warm && !plan?.enabled) return this.normalizePlain(cam);
    const source = plan?.camera || this.legacySource(cam, safe);
    return safe.mobile ? this.mobile(source, plan) : this.desktop(source, plan);
  }

  static legacySource(cam = {}, safe = {}) {
    const mobile = safe.mobile;
    return {
      ...cam,
      shot: mobile ? 'mobileCinematicTwoShot' : 'cinematicTwoShot',
      cameraId: mobile ? 'mobileCinematicTwoShot' : 'cinematicTwoShot',
      zoom: Number(cam.zoom) > 1 ? Number(cam.zoom) : mobile ? 1.55 : 1.12,
      y: Number.isFinite(Number(cam.y)) ? Number(cam.y) : 48
    };
  }

  static mobile(cam = {}, plan = {}) {
    const beat = plan?.beat || cam.shot || 'twoShot';
    const minimum = /close|reaction|insert/i.test(beat) ? 1.9 : /establish/i.test(beat) ? 1.18 : 1.55;
    return this.finalize(cam, beat, minimum, /insert/i.test(beat) ? 2.55 : 2.3);
  }

  static desktop(cam = {}, plan = {}) {
    const beat = plan?.beat || cam.shot || 'twoShot';
    const minimum = /close|reaction|insert/i.test(beat) ? 1.45 : 1.05;
    return this.finalize(cam, beat, minimum, 2.1);
  }

  static finalize(cam = {}, beat = 'twoShot', min = 1.2, max = 2.3) {
    return {
      ...cam,
      x: this.number(cam.x, 0),
      y: this.number(cam.y, 48),
      zoom: this.clamp(Math.max(this.number(cam.zoom, min), min), min, max),
      shot: cam.shot || beat,
      framing: cam.framing || cam.shot || beat,
      cameraId: cam.cameraId || cam.shot || beat,
      cinematicDirector: true,
      storyPriority: /insert/.test(beat) ? 'prop' : /close|reaction/.test(beat) ? 'face' : 'faces_hands_table'
    };
  }

  static normalizePlain(cam = {}) {
    return { ...cam, x: this.number(cam.x, 0), y: this.number(cam.y, 0), zoom: this.clamp(this.number(cam.zoom, 1), 0.2, 4) };
  }

  static number(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  static clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
}
