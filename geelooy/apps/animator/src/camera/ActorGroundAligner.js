// B"H
import { MobileCameraMercy } from './MobileCameraMercy.js';

/**
 * The ground remains a covenant, but cinematic shots may rise above the old
 * ankle-prison. Faces, hands, and props now pull the lens upward and inward.
 */
export class ActorGroundAligner {
  static transform(safe = {}, cam = {}) {
    const framed = MobileCameraMercy.normalize(safe, cam);
    const profile = this.profile(framed);
    const zoom = this.zoom(safe, framed, profile);
    const cameraX = this.clamp(Number(framed.x || 0), -620, 620);
    const cameraY = this.clamp(Number.isFinite(framed.y) ? framed.y : profile.defaultY, profile.minY, profile.maxY);
    const anchor = this.anchorY(safe, profile);
    return {
      x: safe.centerX - cameraX * zoom,
      y: anchor - cameraY * zoom,
      scaleX: zoom,
      scaleY: zoom,
      rotation: Number.isFinite(cam.rotation) ? cam.rotation : 0
    };
  }

  static zoom(safe, cam, profile) {
    const requested = Number.isFinite(cam.zoom) ? cam.zoom : profile.defaultZoom;
    const min = safe.mobile ? profile.mobileMin : profile.desktopMin;
    const max = safe.mobile ? profile.mobileMax : profile.desktopMax;
    return this.clamp(requested, min, max);
  }

  static profile(cam = {}) {
    const text = `${cam.cameraId || ''} ${cam.shot || ''} ${cam.type || ''} ${cam.framing || ''}`;
    if (cam.cinematicDirector && /insert|prop|object/i.test(text)) return this.cinematicInsert();
    if (cam.cinematicDirector && /close|reaction|face/i.test(text)) return this.cinematicClose();
    if (cam.cinematicDirector && /two|medium|dialogue|establish/i.test(text)) return this.cinematicTwo();
    if (/insert|extremeClose|face|close|reaction|catch/i.test(text)) return this.legacyClose();
    if (/two/i.test(text)) return { kind: 'two', defaultZoom: 1.18, mobileMin: 1, mobileMax: 1.55, desktopMin: 0.82, desktopMax: 1.65, defaultY: 32, minY: -70, maxY: 105, anchorRatio: 0.76 };
    if (/tracking|walk|action|throw|medium|speaker/i.test(text)) return { kind: 'medium', defaultZoom: 1.08, mobileMin: 0.9, mobileMax: 1.5, desktopMin: 0.72, desktopMax: 1.6, defaultY: 18, minY: -80, maxY: 100, anchorRatio: 0.76 };
    return { kind: 'wide', defaultZoom: 0.56, mobileMin: 0.48, mobileMax: 0.84, desktopMin: 0.42, desktopMax: 1.02, defaultY: -122, minY: -180, maxY: -60, anchorRatio: 0.79 };
  }

  static cinematicTwo() { return { kind: 'cinematicTwo', defaultZoom: 1.62, mobileMin: 1.52, mobileMax: 2.1, desktopMin: 1.02, desktopMax: 1.45, defaultY: 48, minY: -20, maxY: 118, anchorRatio: 0.66 }; }
  static cinematicClose() { return { kind: 'cinematicClose', defaultZoom: 2.1, mobileMin: 1.9, mobileMax: 2.55, desktopMin: 1.35, desktopMax: 2.25, defaultY: 58, minY: -10, maxY: 98, anchorRatio: 0.64 }; }
  static cinematicInsert() { return { kind: 'cinematicInsert', defaultZoom: 2.35, mobileMin: 2.05, mobileMax: 2.65, desktopMin: 1.55, desktopMax: 2.35, defaultY: 112, minY: 40, maxY: 150, anchorRatio: 0.7 }; }
  static legacyClose() { return { kind: 'close', defaultZoom: 2.35, mobileMin: 1.72, mobileMax: 2.85, desktopMin: 1.5, desktopMax: 3.1, defaultY: 30, minY: -50, maxY: 115, anchorRatio: 0.69 }; }

  static anchorY(safe = {}, profile = {}) {
    const actorBottom = Number(safe.actorBottom || safe.height || 720);
    return actorBottom * Number(profile.anchorRatio || 0.78);
  }

  static clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v))); }
}
