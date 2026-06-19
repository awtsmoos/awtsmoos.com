// B"H
import { PropProcessor } from './PropProcessor.js';
import { CameraProcessor } from './CameraProcessor.js';
import { CharacterProcessor } from './CharacterProcessor.js';
import { SpeechProcessor } from './SpeechProcessor.js';
import { KinematicGrasp } from '../../../../engine/reality/interaction/KinematicGrasp.js';
import { CustomActionEngine } from '../../../../engine/reality/interaction/CustomActionEngine.js';

/**
 * @file EventProcessor.js
 * @description
 * Chapter: The director separated ending from erasing.
 * Cleanup must not poison the next walk, kill camera intent, or leave stale
 * gestures biting the animation. It clears only transient breath and lets the
 * next event speak in its own hour.
 */
export class EventProcessor {
  /**
   * Processes one event through its department.
   *
   * @param {Object} director - Director instance.
   * @param {Object} event - Timeline event.
   * @param {number} t - Progress.
   * @param {number} elapsed - Elapsed time.
   * @returns {void}
   */
  static process(director, event, t, elapsed) {
    const state = director.app.state;
    const normalized = this.normalizeEvent(event);
    const fn = this.handlers(state, normalized, t, elapsed)[normalized.type];
    if (fn) fn();
  }

  /** @param {Object} state @param {Object} event @param {number} t @param {number} elapsed @returns {Object} */
  static handlers(state, event, t, elapsed) {
    return {
      character: () => CharacterProcessor.process(state, event, t, elapsed),
      action: () => CharacterProcessor.process(state, event, t, elapsed),
      speech: () => this.speech(state, event, t, elapsed),
      prop: () => PropProcessor.process(state, event, t, elapsed),
      object: () => PropProcessor.process(state, { ...event, type: event.propType || event.objectType || 'object' }, t, elapsed),
      interaction: () => CharacterProcessor.process(state, event, t, elapsed),
      camera: () => CameraProcessor.process(state, event, t),
      interact: () => { if (t <= 0.001) KinematicGrasp.evaluate(event, state); },
      custom_macro: () => { if (t <= 0.001) CustomActionEngine.execute(event, state); }
    };
  }

  /** @param {Object} event - Raw event. @returns {Object} Normalized event. */
  static normalizeEvent(event = {}) {
    return { ...event, id: event.id || event.actor || event.target };
  }

  /**
   * Applies speech while preserving body motion.
   *
   * @param {Object} state - State.
   * @param {Object} event - Event.
   * @param {number} t - Progress.
   * @param {number} elapsed - Elapsed ms.
   * @returns {void}
   */
  static speech(state, event, t, elapsed) {
    CharacterProcessor.process(state, event, t, elapsed);
    SpeechProcessor.process(state, {
      ...event,
      speech: event.speech || event.text || '',
      speechLocalTime: Math.max(0, elapsed - (event.start || 0)),
      speechDuration: Math.max(500, (event.end || 0) - (event.start || 0))
    }, t);
  }

  /**
   * Cleans only transient event state.
   *
   * @param {Object} director - Director.
   * @param {Object} event - Finished event.
   * @returns {void}
   */
  static cleanup(director, event = {}) {
    const state = director.app.state;
    const id = event.id || event.actor || event.target;
    if (!id || event.type === 'camera' || event.type === 'prop') return;

    const chars = state.get('characters') || {};
    const current = chars[id];
    if (!current) return;
    const next = { ...current, position: { ...(current.position || {}) } };

    if (event.type === 'speech' || event.speech || event.text) this.clearSpeech(next, state);
    if (event.type === 'character' || event.type === 'action') this.settleBody(next, event);
    state.set('characters', { ...chars, [id]: next }, true);
  }

  /** @param {Object} next @param {Object} state @returns {void} */
  static clearSpeech(next, state) {
    next.speech = null;
    next.isTalking = false;
    next.speechLocalTime = 0;
    next.speechDuration = 0;
    next.speechSeed = null;
    state.set('activeDialogue', null, true);
  }

  /** @param {Object} next @param {Object} event @returns {void} */
  static settleBody(next, event) {
    if (event.pos?.to) next.position = { ...next.position, ...event.pos.to };
    next.locomotion = 'idle';
    next.motionMode = 'settled';
    next.isWalking = false;
    next.isRunning = false;
    if (!next.isTalking) {
      next.gesture = 'none';
      next.acting = 'idle';
    }
  }
}
