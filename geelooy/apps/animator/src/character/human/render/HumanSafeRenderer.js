
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { HumanSkeletonFactory } from '../skeleton/HumanSkeletonFactory.js';

/**
 * @file HumanSafeRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE SAFE HUMAN BEFORE ALL GLORY
 * ============================================================================
 *
 * The old renderer, the new composer, and the skeleton experiment were all
 * fighting for one body. Limbs multiplied, legs smeared, and crowds collapsed.
 * This renderer is the emergency seder: one character, one skeleton, one body,
 * one draw path.
 *
 * It intentionally bypasses the unstable StableCharacterAssembler and the
 * unstable performance composer. It draws clean humans directly from a simple
 * skeleton so the stage can become usable again before deeper realism returns.
 *
 * @module HumanSafeRenderer
 */

/**
 * @class HumanSafeRenderer
 * @description
 * Stable skeleton-only human renderer used while the advanced rig is repaired.
 */
export class HumanSafeRenderer {
  /**
   * Builds a clean human graph.
   *
   * @param {Object} character - Character data.
   * @param {Object} ctx - Render context.
   * @param {Object|null} state - App state.
   * @returns {Object} VirtualGraph group for one human.
   */
  static render(character = {}, ctx = {}, state = null) {
    const data = this.normalize(character);
    const skeleton = HumanSkeletonFactory.create(data, ctx, state);
    const id = data.id || 'safe_human';
    const palette = this.palette(data);

    return {
      node: G.group(id + '_safe_human', null, [
        this.shadow(id, skeleton),
        this.leg(id, 'far_left_leg', skeleton.leftHip, skeleton.leftKnee, skeleton.leftAnkle, skeleton.leftFoot, palette.pants, 0.74),
        this.leg(id, 'far_right_leg', skeleton.rightHip, skeleton.rightKnee, skeleton.rightAnkle, skeleton.rightFoot, palette.pants, 0.74),
        this.torso(id, skeleton, palette),
        this.arm(id, 'left_arm', skeleton.leftShoulder, skeleton.leftElbow, skeleton.leftWrist, skeleton.leftHand, palette.coat),
        this.arm(id, 'right_arm', skeleton.rightShoulder, skeleton.rightElbow, skeleton.rightWrist, skeleton.rightHand, palette.coat),
        this.neck(id, skeleton, palette),
        this.head(id, skeleton, palette),
        this.hair(id, skeleton, palette),
        this.eyes(id, skeleton),
        this.brows(id, skeleton, data),
        this.mouth(id, skeleton, data),
        this.shoes(id, skeleton, palette)
      ]),
      skeleton,
      bounds: this.bounds(skeleton, data)
    };
  }

  /**
   * Normalizes character data for safe rendering.
   *
   * @param {Object} character - Raw character data.
   * @returns {Object} Safe character data.
   */
  static normalize(character = {}) {
    const position = character.position || {};
    const perf = character.currentPerformance || {};
    return {
      ...character,
      position: {
        x: Number(position.x) || 0,
        y: Number(position.y) || 0
      },
      scale: Math.max(0.58, Math.min(1.08, Number(character.scale) || 0.82)),
      action: perf.locomotion || character.action || 'idle',
      gesture: perf.gesture || character.gesture || 'none',
      emotion: perf.emotion || character.emotion || 'calm',
      speaking: Boolean(character.speaking || character.dialogue || perf.speech === 'talk')
    };
  }

  /**
   * Resolves palette.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Color palette.
   */
  static palette(data) {
    const chosen = data.palette || {};
    const coats = ['#7c4dff', '#2f8cff', '#ff4f9a', '#20a86b', '#1f6feb'];
    const seed = String(data.id || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return {
      skin: chosen.skin || '#f3bd8f',
      hair: chosen.hair || '#3a2316',
      coat: chosen.coat || coats[seed % coats.length],
      shirt: chosen.shirt || '#f8efe0',
      pants: chosen.pants || '#101827',
      shoe: chosen.shoe || '#08080a',
      eye: chosen.eye || '#111111',
      mouth: chosen.mouth || '#7f1d1d',
      brow: chosen.brow || '#2a160c'
    };
  }

  /**
   * Builds ground shadow.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @returns {Object} Graph node.
   */
  static shadow(id, s) {
    return G.ellipse ? G.ellipse(id + '_shadow', {
      x: s.root.x,
      y: s.root.y + 72,
      radiusX: 46,
      radiusY: 10,
      fill: 'rgba(0,0,0,0.35)'
    }) : G.rect(id + '_shadow', {
      x: s.root.x - 42,
      y: s.root.y + 66,
      width: 84,
      height: 12,
      fill: 'rgba(0,0,0,0.35)',
      radius: 8
    });
  }

  /**
   * Builds torso.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} p - Palette.
   * @returns {Object} Graph node.
   */
  static torso(id, s, p) {
    const top = s.chest.y - 4;
    const bottom = s.pelvis.y + 8;
    return G.group(id + '_torso_group', null, [
      G.rect(id + '_shirt', {
        x: s.chest.x - 20,
        y: top + 10,
        width: 40,
        height: Math.max(44, bottom - top - 12),
        fill: p.shirt,
        radius: 10
      }),
      G.rect(id + '_coat', {
        x: s.chest.x - 40,
        y: top,
        width: 80,
        height: Math.max(74, bottom - top + 34),
        fill: p.coat,
        stroke: '#101014',
        lineWidth: 2,
        radius: 16
      }),
      G.rect(id + '_lapel_left', {
        x: s.chest.x - 24,
        y: top + 8,
        width: 14,
        height: 54,
        fill: 'rgba(255,255,255,0.28)',
        radius: 6
      }),
      G.rect(id + '_lapel_right', {
        x: s.chest.x + 10,
        y: top + 8,
        width: 14,
        height: 54,
        fill: 'rgba(0,0,0,0.16)',
        radius: 6
      })
    ]);
  }

  /**
   * Builds neck.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} p - Palette.
   * @returns {Object} Graph node.
   */
  static neck(id, s, p) {
    return G.rect(id + '_neck', {
      x: s.neck.x - 9,
      y: s.neck.y - 2,
      width: 18,
      height: 24,
      fill: p.skin,
      radius: 8
    });
  }

  /**
   * Builds head.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} p - Palette.
   * @returns {Object} Graph node.
   */
  static head(id, s, p) {
    return G.circle(id + '_head', {
      x: s.head.x,
      y: s.head.y,
      radius: 30,
      fill: p.skin,
      stroke: '#2a160c',
      lineWidth: 2
    });
  }

  /**
   * Builds hair cap.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} p - Palette.
   * @returns {Object} Graph node.
   */
  static hair(id, s, p) {
    return G.group(id + '_hair_group', null, [
      G.rect(id + '_hair_cap', {
        x: s.head.x - 28,
        y: s.head.y - 32,
        width: 56,
        height: 18,
        fill: p.hair,
        radius: 14
      }),
      G.rect(id + '_hair_left', {
        x: s.head.x - 32,
        y: s.head.y - 22,
        width: 12,
        height: 40,
        fill: p.hair,
        radius: 8
      }),
      G.rect(id + '_hair_right', {
        x: s.head.x + 20,
        y: s.head.y - 22,
        width: 12,
        height: 40,
        fill: p.hair,
        radius: 8
      })
    ]);
  }

  /**
   * Builds eyes.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @returns {Object} Graph node.
   */
  static eyes(id, s) {
    return G.group(id + '_eyes', null, [
      G.circle(id + '_eye_left_white', { x: s.head.x - 10, y: s.head.y - 5, radius: 6, fill: '#ffffff' }),
      G.circle(id + '_eye_right_white', { x: s.head.x + 10, y: s.head.y - 5, radius: 6, fill: '#ffffff' }),
      G.circle(id + '_eye_left_dot', { x: s.head.x - 9, y: s.head.y - 4, radius: 2.6, fill: '#111111' }),
      G.circle(id + '_eye_right_dot', { x: s.head.x + 11, y: s.head.y - 4, radius: 2.6, fill: '#111111' })
    ]);
  }

  /**
   * Builds expressive brows.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} data - Character data.
   * @returns {Object} Graph node.
   */
  static brows(id, s, data) {
    const intense = data.emotion === 'intense' || data.emotion === 'angry';
    const happy = data.emotion === 'happy';
    const lift = happy ? -3 : intense ? 3 : 0;
    const pinch = intense ? 3 : 0;
    return G.group(id + '_brows', null, [
      G.rect(id + '_brow_left', {
        x: s.head.x - 19 + pinch,
        y: s.head.y - 17 + lift,
        width: 16,
        height: 4,
        fill: '#2a160c',
        radius: 3
      }),
      G.rect(id + '_brow_right', {
        x: s.head.x + 3 - pinch,
        y: s.head.y - 17 + lift,
        width: 16,
        height: 4,
        fill: '#2a160c',
        radius: 3
      })
    ]);
  }

  /**
   * Builds mouth.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} data - Character data.
   * @returns {Object} Graph node.
   */
  static mouth(id, s, data) {
    const open = data.speaking ? 8 : 4;
    const width = data.emotion === 'happy' ? 22 : 16;
    return G.rect(id + '_mouth', {
      x: s.head.x - width / 2,
      y: s.head.y + 13,
      width,
      height: open,
      fill: '#7f1d1d',
      radius: open
    });
  }

  /**
   * Builds arm from joints.
   *
   * @param {string} id - Character id.
   * @param {string} name - Part name.
   * @param {Object} shoulder - Shoulder joint.
   * @param {Object} elbow - Elbow joint.
   * @param {Object} wrist - Wrist joint.
   * @param {Object} hand - Hand joint.
   * @param {string} color - Sleeve color.
   * @returns {Object} Graph node.
   */
  static arm(id, name, shoulder, elbow, wrist, hand, color) {
    return G.group(id + '_' + name, null, [
      this.segment(id + '_' + name + '_upper', shoulder, elbow, 13, color),
      this.segment(id + '_' + name + '_lower', elbow, wrist, 12, color),
      G.circle(id + '_' + name + '_hand', { x: hand.x, y: hand.y, radius: 6, fill: '#f3bd8f', stroke: '#2a160c', lineWidth: 1 })
    ]);
  }

  /**
   * Builds leg from joints.
   *
   * @param {string} id - Character id.
   * @param {string} name - Name.
   * @param {Object} hip - Hip joint.
   * @param {Object} knee - Knee joint.
   * @param {Object} ankle - Ankle joint.
   * @param {Object} foot - Foot joint.
   * @param {string} color - Pants color.
   * @param {number} alpha - Alpha.
   * @returns {Object} Graph node.
   */
  static leg(id, name, hip, knee, ankle, foot, color, alpha) {
    return G.group(id + '_' + name, null, [
      this.segment(id + '_' + name + '_thigh', hip, knee, 16, color),
      this.segment(id + '_' + name + '_shin', knee, ankle, 14, color),
      G.rect(id + '_' + name + '_foot', { x: foot.x - 14, y: foot.y - 5, width: 28, height: 10, fill: '#08080a', radius: 5 })
    ]);
  }

  /**
   * Builds shoes.
   *
   * @param {string} id - Character id.
   * @param {Object} s - Skeleton.
   * @param {Object} p - Palette.
   * @returns {Object} Graph node.
   */
  static shoes(id, s, p) {
    return G.group(id + '_shoes', null, [
      G.rect(id + '_left_shoe', { x: s.leftFoot.x - 16, y: s.leftFoot.y - 4, width: 32, height: 9, fill: p.shoe, radius: 5 }),
      G.rect(id + '_right_shoe', { x: s.rightFoot.x - 16, y: s.rightFoot.y - 4, width: 32, height: 9, fill: p.shoe, radius: 5 })
    ]);
  }

  /**
   * Builds a limb segment as a rectangle.
   *
   * @param {string} id - Node id.
   * @param {Object} a - Start point.
   * @param {Object} b - End point.
   * @param {number} thickness - Thickness.
   * @param {string} fill - Fill color.
   * @returns {Object} Rect node.
   */
  static segment(id, a, b, thickness, fill) {
    return G.rect(id, {
      x: Math.min(a.x, b.x) - thickness / 2,
      y: Math.min(a.y, b.y) - thickness / 2,
      width: Math.max(thickness, Math.abs(b.x - a.x) + thickness),
      height: Math.max(thickness, Math.abs(b.y - a.y) + thickness),
      fill,
      radius: thickness / 2
    });
  }

  /**
   * Computes bounds.
   *
   * @param {Object} s - Skeleton.
   * @param {Object} data - Character data.
   * @returns {Object} Bounds.
   */
  static bounds(s, data) {
    const points = Object.values(s).filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y));
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const pad = 36;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
}
