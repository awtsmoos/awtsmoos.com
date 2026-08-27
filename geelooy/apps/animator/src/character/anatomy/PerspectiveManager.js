
import { PanimPartzuf } from './perspectives/PanimPartzuf.js';
import { ZairAnpinPartzuf } from './perspectives/ZairAnpinPartzuf.js';
import { AchoraimPartzuf } from './perspectives/AchoraimPartzuf.js';
import { KeterPartzuf } from './perspectives/KeterPartzuf.js';
import { MalchutPartzuf } from './perspectives/MalchutPartzuf.js';
import { ANATOMY } from '../data/Anatomy.js';

/**
 * @file PerspectiveManager.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE PROFILE RECEIVES THE TRUE DIRECTION
 * ═══════════════════════════════════════════════════════════════
 *
 * The previous API accepted only viewType. That meant flipX lived outside the
 * profile. Arm depth and near/far logic read profile.dir, while the entire
 * group could still be flipped later by negative scaleX.
 *
 * This manager now accepts facingDir. Existing callers still work because the
 * default is 1, but corrected assemblers can pass -1 directly.
 *
 * The Awtsmoos is beyond direction; created geometry is not. Once a direction
 * is made, it must be true everywhere.
 *
 * @class PerspectiveManager
 */
export class PerspectiveManager {
  /**
   * Returns a complete perspective profile.
   *
   * @param {string} viewType - Perspective name.
   * @param {number} facingDir - Visible direction, 1 or -1.
   * @returns {Object} Complete profile.
   */
  static get(viewType = 'front', facingDir = 1) {
    const canonical = this.normalizeView(viewType);
    const partzuf = this.create(canonical);
    const dir = facingDir === -1 ? -1 : 1;
    const eOff = ANATOMY.face?.eyes?.offsetX || 18;

    return this.withDirection({
      type: partzuf.type || canonical,
      dir,
      headOffset: partzuf.headOffset || partzuf.head?.x || 0,
      head: partzuf.head || { x: 0, y: 0 },
      body: partzuf.body || { scaleX: 1, y: 0 },
      torso: partzuf.torso || { width: ANATOMY.body?.widthTop || 96 },
      eyes: partzuf.eyes || {
        visible: ['left', 'right'],
        left: { x: -eOff, y: 0, scaleX: 1, scaleY: 1 },
        right: { x: eOff, y: 0, scaleX: 1, scaleY: 1 }
      },
      eyebrows: partzuf.eyebrows || {
        visible: ['left', 'right'],
        left: { x: -eOff, y: 0, scaleX: 1 },
        right: { x: eOff, y: 0, scaleX: 1 }
      },
      mouth: partzuf.mouth || { x: 0, y: 0, scaleX: 1, scaleY: 1 },
      beard: partzuf.beard || { x: 0, y: 0, scaleX: 1 },
      nose: partzuf.nose || { x: 0, y: 0 },
      ears: partzuf.ears || {
        visible: ['left', 'right'],
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
      },
      legs: partzuf.legs || { spread: 22 },
      arms: partzuf.arms || { spread: 52, dirLeft: -1, dirRight: 1 },
      feet: partzuf.feet || { angleLeft: -15, angleRight: 15, dirLeft: -1, dirRight: 1 }
    }, dir);
  }

  /**
   * Creates a partzuf instance for a canonical view.
   *
   * @param {string} viewType - Canonical view.
   * @returns {Object} Partzuf instance.
   */
  static create(viewType) {
    const map = {
      front: () => new PanimPartzuf(),
      threeQuarter: () => new ZairAnpinPartzuf(),
      side: () => new AchoraimPartzuf(),
      back: () => new AchoraimPartzuf(),
      up: () => new KeterPartzuf(),
      down: () => new MalchutPartzuf()
    };

    return (map[viewType] || map.front)();
  }

  /**
   * Applies visible direction to key X offsets.
   *
   * @param {Object} profile - Raw profile.
   * @param {number} dir - Direction.
   * @returns {Object} Direction-aware profile.
   */
  static withDirection(profile, dir) {
    return {
      ...profile,
      dir,
      headOffset: (profile.headOffset || 0) * dir,
      nose: { ...(profile.nose || {}), x: (profile.nose?.x || 0) * dir },
      mouth: { ...(profile.mouth || {}), x: (profile.mouth?.x || 0) * dir },
      beard: { ...(profile.beard || {}), x: (profile.beard?.x || 0) * dir },
      arms: { ...(profile.arms || {}), dirLeft: -1 * dir, dirRight: 1 * dir },
      feet: { ...(profile.feet || {}), dirLeft: -1 * dir, dirRight: 1 * dir }
    };
  }

  /**
   * Normalizes view names.
   *
   * @param {string} viewType - Raw view name.
   * @returns {string} Canonical view.
   */
  static normalizeView(viewType) {
    const map = {
      threequarter: 'threeQuarter',
      threeQuarter: 'threeQuarter',
      three_quarter: 'threeQuarter',
      '3q': 'threeQuarter',
      front: 'front',
      side: 'side',
      back: 'back',
      up: 'up',
      down: 'down'
    };

    return map[viewType] || 'front';
  }
}
