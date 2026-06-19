
// B"H
import { HumanRigProfileResolver } from '../rig/HumanRigProfileRegistry.js';
import { HumanWalkCycle } from '../motion/HumanWalkCycle.js';
import { BrowSystem } from '../face/brows/BrowSystem.js';
import { BrowRenderer } from '../face/brows/BrowRenderer.js';
import { EyeSystem } from '../face/EyeSystem.js';
import { MouthSystem } from '../face/MouthSystem.js';

/**
 * @file HumanCanvasRigRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE STABLE HUMAN RIG V2
 * ============================================================================
 *
 * A full direct-canvas human renderer using body profiles, walk cycles, curved
 * brows, blinking eyes, speech mouth, organic torso, layered limbs, hair,
 * shadows, and readable depth. This replaces the crude emergency icon people
 * without reactivating the broken old assembler.
 *
 * @module HumanCanvasRigRenderer
 */

/**
 * @class HumanCanvasRigRenderer
 * @description
 * Direct canvas stable human rig renderer.
 */
export class HumanCanvasRigRenderer {
  /**
   * Draws one human.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {Object} args - Draw args.
   * @returns {void}
   */
  static draw(ctx, args) {
    const { x, y, scale, character, index, time } = args;
    const p = HumanRigProfileResolver.resolve(character, scale);
    const motion = HumanWalkCycle.sample(character, time + index * 77, scale);
    const colors = this.colors(character, index);
    const perf = character.currentPerformance || {};
    const emotion = perf.emotion || character.emotion || 'calm';
    const speaking = Boolean(character.speaking || character.dialogue || perf.speech === 'talk');
    const footY = y + motion.pelvisBob;
    const pelvis = { x: x + motion.hipSway, y: footY - p.foot - 5 * scale - p.shin - p.thigh };
    const chest = { x: x + motion.shoulderSway, y: pelvis.y - p.torso };
    const neck = { x: chest.x, y: chest.y - p.neck };
    const head = { x: neck.x, y: neck.y - p.head + motion.headCounter };
    const leftFoot = { x: x - p.hip * 0.42 + motion.left.x, y: footY + motion.left.y };
    const rightFoot = { x: x + p.hip * 0.42 + motion.right.x, y: footY + motion.right.y };
    const leftKnee = { x: (pelvis.x + leftFoot.x) * 0.5 - 8 * scale, y: (pelvis.y + leftFoot.y) * 0.5 - motion.left.knee };
    const rightKnee = { x: (pelvis.x + rightFoot.x) * 0.5 + 8 * scale, y: (pelvis.y + rightFoot.y) * 0.5 - motion.right.knee };
    const leftShoulder = { x: chest.x - p.shoulder * 0.5, y: chest.y + 8 * scale };
    const rightShoulder = { x: chest.x + p.shoulder * 0.5, y: chest.y + 8 * scale };
    const wave = (perf.gesture || character.gesture) === 'wave';
    const leftHand = { x: leftShoulder.x - 18 * scale - motion.armSwing * 0.3, y: pelvis.y + 22 * scale };
    const rightHand = wave
      ? { x: rightShoulder.x + 36 * scale + Math.sin(time * 0.018) * 11 * scale, y: rightShoulder.y - 55 * scale }
      : { x: rightShoulder.x + 18 * scale - motion.armSwing * 0.3, y: pelvis.y + 22 * scale };
    const leftElbow = { x: (leftShoulder.x + leftHand.x) * 0.5 - 8 * scale, y: (leftShoulder.y + leftHand.y) * 0.5 + 18 * scale };
    const rightElbow = { x: (rightShoulder.x + rightHand.x) * 0.5 + 8 * scale, y: (rightShoulder.y + rightHand.y) * 0.5 + (wave ? -4 : 18) * scale };

    this.shadow(ctx, x, footY, scale);
    this.leg(ctx, pelvis, leftKnee, leftFoot, colors.pants, scale, -1);
    this.leg(ctx, pelvis, rightKnee, rightFoot, colors.pants, scale, 1);
    this.shoe(ctx, leftFoot, scale, colors.shoe, -1);
    this.shoe(ctx, rightFoot, scale, colors.shoe, 1);
    this.arm(ctx, leftShoulder, leftElbow, leftHand, colors.coat, colors.skin, scale);
    this.arm(ctx, rightShoulder, rightElbow, rightHand, colors.coat, colors.skin, scale);
    this.torso(ctx, chest, pelvis, p, colors, scale, motion);
    this.neck(ctx, neck, colors.skin, scale);
    this.head(ctx, head, p.head, colors, { ...character, emotion, speaking }, scale, time, index);
    this.nameTag(ctx, x, footY + 18 * scale, character.id || args.id || '', scale);
  }

  /**
   * Draws organic torso and clothing.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} chest - Chest.
   * @param {Object} pelvis - Pelvis.
   * @param {Object} p - Profile.
   * @param {Object} colors - Colors.
   * @param {number} scale - Scale.
   * @param {Object} motion - Motion.
   * @returns {void}
   */
  static torso(ctx, chest, pelvis, p, colors, scale, motion) {
    const shoulder = p.shoulder;
    const waist = p.waist;
    const hip = p.hip + p.coatFlare;
    const top = chest.y;
    const bottom = pelvis.y + 42 * scale;

    ctx.save();
    ctx.fillStyle = colors.coat;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(chest.x - shoulder * 0.5, top + 6 * scale);
    ctx.quadraticCurveTo(chest.x - waist * 0.65, top + 48 * scale, chest.x - hip * 0.5, bottom);
    ctx.lineTo(chest.x + hip * 0.5, bottom);
    ctx.quadraticCurveTo(chest.x + waist * 0.65, top + 48 * scale, chest.x + shoulder * 0.5, top + 6 * scale);
    ctx.quadraticCurveTo(chest.x, top - 10 * scale + motion.breath, chest.x - shoulder * 0.5, top + 6 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.shirt;
    ctx.beginPath();
    ctx.moveTo(chest.x - 16 * scale, top + 12 * scale);
    ctx.lineTo(chest.x + 16 * scale, top + 12 * scale);
    ctx.lineTo(chest.x + 12 * scale, bottom - 12 * scale);
    ctx.lineTo(chest.x - 12 * scale, bottom - 12 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    this.roundRect(ctx, chest.x - 28 * scale, top + 16 * scale, 9 * scale, 62 * scale, 5 * scale, 'rgba(255,255,255,0.24)');
    ctx.restore();
  }

  /**
   * Draws a leg chain.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} hip - Hip.
   * @param {Object} knee - Knee.
   * @param {Object} foot - Foot.
   * @param {string} color - Color.
   * @param {number} scale - Scale.
   * @param {number} side - Side.
   * @returns {void}
   */
  static leg(ctx, hip, knee, foot, color, scale, side) {
    this.limb(ctx, { x: hip.x + side * 15 * scale, y: hip.y + 4 * scale }, knee, 15 * scale, color);
    this.limb(ctx, knee, { x: foot.x - side * 3 * scale, y: foot.y - 8 * scale }, 13 * scale, color);
  }

  /**
   * Draws arm chain.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} shoulder - Shoulder.
   * @param {Object} elbow - Elbow.
   * @param {Object} hand - Hand.
   * @param {string} sleeve - Sleeve.
   * @param {string} skin - Skin.
   * @param {number} scale - Scale.
   * @returns {void}
   */
  static arm(ctx, shoulder, elbow, hand, sleeve, skin, scale) {
    this.limb(ctx, shoulder, elbow, 12 * scale, sleeve);
    this.limb(ctx, elbow, hand, 10 * scale, sleeve);
    ctx.fillStyle = skin;
    ctx.strokeStyle = '#2a160c';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.arc(hand.x, hand.y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Draws capsule limb.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} a - A.
   * @param {Object} b - B.
   * @param {number} width - Width.
   * @param {string} color - Color.
   * @returns {void}
   */
  static limb(ctx, a, b, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  /**
   * Draws shoe.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} foot - Foot.
   * @param {number} scale - Scale.
   * @param {string} color - Color.
   * @param {number} side - Side.
   * @returns {void}
   */
  static shoe(ctx, foot, scale, color, side) {
    this.roundRect(ctx, foot.x - 16 * scale, foot.y - 5 * scale, 34 * scale, 10 * scale, 6 * scale, color);
  }

  /**
   * Draws shadow.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} scale - Scale.
   * @returns {void}
   */
  static shadow(ctx, x, y, scale) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * scale, 54 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws neck.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} neck - Neck.
   * @param {string} skin - Skin.
   * @param {number} scale - Scale.
   * @returns {void}
   */
  static neck(ctx, neck, skin, scale) {
    this.roundRect(ctx, neck.x - 9 * scale, neck.y - 4 * scale, 18 * scale, 23 * scale, 8 * scale, skin);
  }

  /**
   * Draws head and full face.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} head - Head.
   * @param {number} radius - Radius.
   * @param {Object} colors - Colors.
   * @param {Object} character - Character.
   * @param {number} scale - Scale.
   * @param {number} time - Time.
   * @param {number} index - Index.
   * @returns {void}
   */
  static head(ctx, head, radius, colors, character, scale, time, index) {
    ctx.fillStyle = colors.skin;
    ctx.strokeStyle = '#2a160c';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.beginPath();
    ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.hair(ctx, head, radius, colors.hair, scale);

    const eyes = EyeSystem.sample(character, time, index);
    EyeSystem.draw(ctx, head.x - 9 * scale, head.y - 5 * scale, scale, eyes);
    EyeSystem.draw(ctx, head.x + 9 * scale, head.y - 5 * scale, scale, eyes);

    const browPose = BrowSystem.sample(character, time, index);
    BrowRenderer.draw(ctx, {
      x: head.x,
      y: head.y - 17 * scale,
      scale,
      pose: browPose,
      color: colors.brow
    });

    const mouth = MouthSystem.sample(character, time);
    MouthSystem.draw(ctx, head.x, head.y + 12 * scale, scale, mouth, colors.mouth);
  }

  /**
   * Draws hair in layered cap and side locks.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} head - Head.
   * @param {number} r - Radius.
   * @param {string} color - Hair.
   * @param {number} scale - Scale.
   * @returns {void}
   */
  static hair(ctx, head, r, color, scale) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(head.x, head.y - 4 * scale, r * 1.02, Math.PI, Math.PI * 2);
    ctx.fill();
    this.roundRect(ctx, head.x - r - 2 * scale, head.y - 12 * scale, 10 * scale, 34 * scale, 6 * scale, color);
    this.roundRect(ctx, head.x + r - 8 * scale, head.y - 12 * scale, 10 * scale, 34 * scale, 6 * scale, color);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.arc(head.x - 7 * scale, head.y - 23 * scale, r * 0.42, Math.PI * 1.05, Math.PI * 1.75);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }

  /**
   * Draws name tag.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {string} id - Id.
   * @param {number} scale - Scale.
   * @returns {void}
   */
  static nameTag(ctx, x, y, id, scale) {
    ctx.save();
    ctx.globalAlpha = 0.78;
    this.roundRect(ctx, x - 36 * scale, y, 72 * scale, 15 * scale, 7 * scale, '#000000');
    ctx.fillStyle = '#ffffff';
    ctx.font = Math.max(9, 10 * scale) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(id).slice(0, 11), x, y + 11 * scale);
    ctx.restore();
  }

  /**
   * Resolves colors.
   *
   * @param {Object} character - Character.
   * @param {number} index - Index.
   * @returns {Object} Colors.
   */
  static colors(character, index) {
    const coats = ['#7c4dff', '#2f8cff', '#ff4f9a', '#20a86b', '#1f6feb'];
    return {
      skin: character.palette?.skin || '#f1bd91',
      hair: character.palette?.hair || '#3a2316',
      coat: character.palette?.coat || coats[index % coats.length],
      shirt: character.palette?.shirt || '#fff4df',
      pants: character.palette?.pants || '#111827',
      shoe: character.palette?.shoe || '#050507',
      mouth: character.palette?.mouth || '#7f1d1d',
      brow: character.palette?.brow || '#2a160c'
    };
  }

  /**
   * Draws rounded rectangle.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @param {number} r - Radius.
   * @param {string} fill - Fill.
   * @returns {void}
   */
  static roundRect(ctx, x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
    } else {
      const rr = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
    }
    ctx.fill();
  }
}
