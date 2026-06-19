// B"H

/**
 * @file PerformanceStateNormalizer.js
 * @description
 * The single gate where scattered character fields become layered human
 * performance state. This is the fix for the old false choice of walk OR talk
 * OR wave. A person may walk, talk, wave, look, blink, hold, smile, and breathe
 * in the same frame.
 */
export class PerformanceStateNormalizer {
  /**
   * Converts raw character state into layered performance state.
   *
   * @param {Object} data - Raw character data from runtime state.
   * @returns {Object} Normalized layered state.
   */
  static normalize(data = {}) {
    const acting = data.acting || 'listen_idle';
    const locomotion = this.resolveLocomotion(data, acting);
    const gesture = this.resolveGesture(data, acting);
    const speech = this.resolveSpeech(data, acting);
    const emotion = data.emotion || 'neutral';

    return {
      id: data.id || '',
      locomotion,
      gesture,
      speech,
      emotion,
      gaze: {
        targetId: data.lookAt || null,
        mode: data.lookAt ? 'target' : 'camera_bias'
      },
      facing: {
        mode: data.facingMode || 'auto',
        explicitFlipX: data.flipX === true,
        explicitView: data.view || 'threeQuarter'
      },
      prop: {
        heldPropId: data.heldPropId || null,
        action: data.propAction || 'none'
      },
      balance: {
        intensity: Number.isFinite(data.balanceIntensity) ? data.balanceIntensity : 1
      },
      raw: data
    };
  }

  /**
   * Resolves locomotion without letting speech/gesture cancel it.
   *
   * @param {Object} data - Character data.
   * @param {string} acting - Action name.
   * @returns {Object} Locomotion layer.
   */
  static resolveLocomotion(data, acting) {
    const explicit = data.locomotion || data.locomotionLayer;
    const walking = explicit === 'walk' || acting === 'walk' || data.motionMode === 'worldTravel';
    const running = explicit === 'run' || acting === 'run';

    return {
      type: running ? 'run' : walking ? 'walk' : 'idle',
      speed: running ? 1.7 : walking ? 1 : 0,
      travel: data.position || {},
      cycleOnly: data.motionMode === 'cycleOnly'
    };
  }

  /**
   * Resolves upper-body gesture layer.
   *
   * @param {Object} data - Character data.
   * @param {string} acting - Action.
   * @returns {Object} Gesture layer.
   */
  static resolveGesture(data, acting) {
    const explicit = data.gesture || data.upperBody || data.upperBodyLayer;
    const candidates = new Set([
      'wave',
      'point',
      'open_hand',
      'explain',
      'throw_windup',
      'throw_release',
      'throw_follow',
      'catch_ready',
      'catch',
      'show_prop',
      'react_nod',
      'react_smile',
      'look_action'
    ]);

    return {
      type: explicit || (candidates.has(acting) ? acting : 'none'),
      hand: data.gestureHand || 'auto',
      intensity: Number.isFinite(data.gestureIntensity) ? data.gestureIntensity : 1
    };
  }

  /**
   * Resolves speech layer.
   *
   * @param {Object} data - Character data.
   * @param {string} acting - Action.
   * @returns {Object} Speech layer.
   */
  static resolveSpeech(data, acting) {
    const text = data.speech || '';
    const active = data.isTalking === true || Boolean(text) || acting === 'talking' || acting === 'speak';

    return {
      active,
      text,
      style: data.speechStyle || data.talkStyle || 'clear',
      energy: Number.isFinite(data.speechEnergy) ? data.speechEnergy : active ? 1 : 0
    };
  }
}