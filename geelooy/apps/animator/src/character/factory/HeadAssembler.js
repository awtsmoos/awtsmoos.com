
// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { Skull } from '../anatomy/head/Skull.js';
import { Neck } from '../anatomy/head/Neck.js';
import { MouthGroup } from '../anatomy/mouth/MouthGroup.js';
import { EyeGroup } from '../anatomy/eyes/EyeGroup.js';
import { EyebrowGroup } from '../anatomy/head/eyebrows/EyebrowGroup.js';
import { HairSystem } from '../anatomy/head/hair/HairSystem.js';
import { HatSystem } from '../anatomy/head/hats/HatSystem.js';
import { Ears } from '../anatomy/head/Ears.js';
import { NoseBuilder } from '../anatomy/head/nose/NoseBuilder.js';
import { FaceSystem } from '../anatomy/face/FaceSystem.js';
import { VFXSystem } from '../anatomy/face/VFXSystem.js';
import { ChromaticFlesh } from '../anatomy/face/ChromaticFlesh.js';
import { ANATOMY } from '../data/Anatomy.js';
import { NeckAnchorMetrics } from './modules/NeckAnchorMetrics.js';

/**
 * @file HeadAssembler.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE ORIGINAL FACE SYSTEM RETURNS WITH A SMALL NECK
 * ═══════════════════════════════════════════════════════════════
 *
 * This restores the rich original facial stack: skull, ears, face system,
 * eyes, brows, nose, mouth, vfx, hair, and hat. The only surgical fix is the
 * neck anchor. It no longer stretches from torso to head.
 *
 * The Awtsmoos creates vision, breath, hair, speech, and expression. We do
 * not replace them with crude circles. We restore the vessels and remove the
 * one span that became a monster.
 *
 * @class HeadAssembler
 */
export class HeadAssembler {
  /**
   * Builds the head complex.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @param {number} intensity - Speech intensity.
   * @param {number} sway - Head x sway.
   * @param {number} headY - Head center y.
   * @param {number} headBob - Walk bob.
   * @returns {Object} VirtualGraph node.
   */
  static build(data, profile, intensity = 0, sway = 0, headY = ANATOMY.head.cy, headBob = 0) {
    const time = data._lastDirectorTime || Date.now();
    const h = ANATOMY.head;
    const jawDrop = intensity * 25;
    const hScale = data.mod?.head || 1.0;
    const baseSkin = data.colors?.skin || '#f2c1a2';
    const skinColor = ChromaticFlesh.getTintedColor(baseSkin, data);
    const blink = data.idle?.blink || data.blink || 0;
    const morph = data.morphParams || { squint: 1.0, bx: 0, bi: 0, bo: 0, ba: -5 };

    const neck = NeckAnchorMetrics.fromHead({
      head: h,
      headX: h.cx + sway,
      headY,
      profile,
      data
    });

    if (Math.max(data.joy || 0, data.anger || 0) > 0.8 && data.exaggeration > 0.5) {
      data.hairGravityOverride = -0.5;
    }

    return G.group('head_complex', null, [
      Neck.build({
        startX: neck.startX,
        startY: neck.startY,
        endX: neck.endX,
        endY: neck.endY,
        widthTop: neck.widthTop,
        widthBottom: neck.widthBottom,
        maxHeight: neck.maxHeight,
        skinColor,
        view: data.view,
        flipX: data.flipX
      }),
      G.group('head_perspective_vessel', {
        x: h.cx + sway + (profile.headOffset || 0),
        y: headY,
        rotation: (sway * 0.04) + (data.headTilt || 0),
        scaleX: hScale,
        scaleY: hScale
      }, [
        G.group('hair_back', null, [HairSystem.buildBack(data, profile, h.cy - h.rY)]),
        Ears.draw(h.rX, profile, skinColor, 0, data.earShape),
        Skull.build(skinColor, profile.type, data.flipX, jawDrop),
        FaceSystem.build(data, profile, h.rX, h.rY),
        EyeGroup.build(data, profile, skinColor, blink, morph),
        EyebrowGroup.build(data, profile, morph),
        MouthGroup.build(data, profile, jawDrop),
        NoseBuilder.draw(h.rX, profile, skinColor, jawDrop, intensity),
        G.group('hair_front', null, [HairSystem.build(data, profile, h.cy - h.rY)]),
        HatSystem.build(data, profile, h.cy - h.rY + headBob),
        VFXSystem.build(data, profile, time)
      ])
    ]);
  }
}
