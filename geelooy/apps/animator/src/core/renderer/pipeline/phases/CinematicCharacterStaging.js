// B"H
import { CinematicShotKind } from '../../../../cinema/CinematicShotKind.js';

/**
 * Shot-aware staging that respects real scene actor ids.
 * It only adjusts visibility/scale/focus; the actual character renderer remains
 * untouched so blinking, mouth motion, limbs, and gestures survive.
 */
export class CinematicCharacterStaging {
  static apply(character = {}, info = {}) {
    const camera = info.camera || {};
    const profile = this.profile(camera);
    const id = character.id;
    const active = this.activeIds(camera, info);
    const isFocus = active.focus.includes(id);
    const isSupport = active.support.includes(id);
    const hidden = profile.hideOthers && !isFocus && !isSupport;
    const position = { ...(character.position || {}) };
    const baseScale = Number(position.scale ?? character.scale ?? 0.86);
    const scaleBoost = isFocus ? profile.focusScale : isSupport ? profile.supportScale : profile.otherScale;

    return {
      ...character,
      hiddenByStaging: hidden,
      position: {
        ...position,
        scale: Math.max(0.42, Math.min(1.28, baseScale * scaleBoost)),
        y: Number(position.y || 0) + (isFocus ? profile.focusLift : isSupport ? profile.supportLift : profile.otherLift)
      },
      _cinematicFocus: isFocus,
      _cinematicSupport: isSupport,
      _renderDetailMode: isFocus ? 'closeup' : isSupport ? 'medium' : 'wide',
      lineStyle: isFocus ? 'heroCartoon' : character.lineStyle,
      emotion: isFocus && character.emotion === 'calm' ? 'focused' : character.emotion
    };
  }

  static profile(camera = {}) {
    const kind = CinematicShotKind.resolve(camera);
    if (kind === 'close') return { focusScale: 1.0, supportScale: 0.82, otherScale: 0.62, focusLift: 0, supportLift: 5, otherLift: 10, hideOthers: true };
    if (kind === 'two') return { focusScale: 0.96, supportScale: 0.92, otherScale: 0.72, focusLift: 0, supportLift: 1, otherLift: 8, hideOthers: false };
    if (kind === 'walk' || kind === 'action' || kind === 'medium') return { focusScale: 0.98, supportScale: 0.9, otherScale: 0.68, focusLift: 0, supportLift: 3, otherLift: 8, hideOthers: false };
    return { focusScale: 0.94, supportScale: 0.88, otherScale: 0.82, focusLift: 0, supportLift: 0, otherLift: 0, hideOthers: false };
  }

  static activeIds(camera = {}, info = {}) {
    const dialogue = info.activeDialogue || {};
    const id = String(camera.cameraId || camera.id || '');
    const focus = [];
    const support = [];

    if (Array.isArray(camera.targetActors)) focus.push(...camera.targetActors);
    if (dialogue.speakerId || dialogue.id) focus.unshift(dialogue.speakerId || dialogue.id);
    if (dialogue.listenerId) support.push(dialogue.listenerId);

    if (/hl_kid/.test(id)) focus.push('kid');
    if (/hl_food_insert/.test(id)) focus.push('kid');
    if (/hl_table|hl_establish|hl_celebrate/.test(id)) focus.push('kid', 'guide');
    if (/guide/.test(id)) focus.push('guide');

    if (/c1_walker/.test(id)) focus.push('c1_walker');
    if (/c2_speaker/.test(id)) focus.push('c2_speaker');
    if (/c3_thrower|throw/.test(id)) focus.push('c3_thrower');
    if (/c4_catcher|catch/.test(id)) focus.push('c4_catcher');

    if (!focus.length) focus.push('kid', 'guide');
    return { focus: [...new Set(focus)], support: [...new Set(support.filter(x => !focus.includes(x)))] };
  }
}
