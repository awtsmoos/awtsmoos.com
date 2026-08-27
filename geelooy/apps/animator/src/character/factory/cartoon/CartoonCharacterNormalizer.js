// B"H
import { HUMAN_BELIEVABILITY_PROFILE } from './HumanBelievabilityProfile.js';

/**
 * @file CartoonCharacterNormalizer.js
 * @description
 * ============================================================================
 * CHAPTER: THE DRAWN HUMAN WHO STARTED ACTING
 * ============================================================================
 *
 * The characters were present but not alive enough. This normalizer adds the
 * missing bridge between director state and visible acting state: run, walk,
 * throw, catch, point, explain, wave, think, turn, speak. It preserves readable
 * 2D human design while making motion obvious.
 *
 * The Awtsmoos gives life to all vessels. A cartoon vessel receives life through
 * rhythm, blink, mouth, gesture, weight, and direction.
 *
 * @class CartoonCharacterNormalizer
 */
export class CartoonCharacterNormalizer {
  /**
   * Converts processed character data into believable animated human data.
   *
   * @param {Object} data - Character data after director processing.
   * @param {number} index - Character index.
   * @returns {Object} Normalized character.
   */
  static normalize(data, index = 0) {
    const copy = { ...(data || {}) };
    const existing = copy.colors || {};
    const sage = copy.archetype === 'sage' || copy.style === 'illustrated_sage';

    copy.style = sage ? 'illustrated_sage' : 'believable_cartoon_human';
    copy.visualMode = 'believable_2d_human';
    copy.colors = this.palette(existing, index, sage);
    copy.realism = false;
    copy.hyperReal = false;
    copy.textureDensity = 0;
    copy.microDetail = 0;
    copy.believability = HUMAN_BELIEVABILITY_PROFILE;
    copy.eyeDart = copy.eyeDart || this.eyeDart(copy, index);
    copy.mouthOpen = this.mouth(copy);
    copy.talk = copy.mouthOpen;
    copy.emotion = this.emotion(copy);
    copy.acting = this.acting(copy);
    copy.isWalking = copy.isWalking || copy.acting === 'walk' || copy.acting === 'run';
    copy._cartoonNormalized = true;

    return copy;
  }

  /**
   * Builds vivid but human-friendly colors.
   *
   * @param {Object} colors - Existing color overrides.
   * @param {number} index - Character index.
   * @param {boolean} sage - Whether sage palette is needed.
   * @returns {Object} Complete palette.
   */
  static palette(colors, index, sage) {
    const jackets = ['#6f45c9', '#2f6fc2', '#2f8f66', '#c76d35', '#a83d5f'];
    const pants = ['#151927', '#182542', '#1b2b24', '#2a1f19', '#211729'];
    const hair = ['#17100d', '#352015', '#5a351e', '#111111', '#e9e2d6'];

    return {
      line: colors.line || '#101010',
      skin: colors.skin || '#efb486',
      skinDark: colors.skinDark || '#c77d5c',
      skinLight: colors.skinLight || '#ffd6b2',
      blush: colors.blush || 'rgba(255,112,117,0.30)',
      eye: colors.eye || '#111111',
      eyeLight: colors.eyeLight || '#ffffff',
      mouth: colors.mouth || '#75252b',
      tooth: colors.tooth || '#fff7e8',
      hair: colors.hair || (sage ? '#eee7dc' : hair[index % hair.length]),
      hairDark: colors.hairDark || (sage ? '#beb5a8' : '#0f0907'),
      jacket: colors.jacket || jackets[index % jackets.length],
      jacketDark: colors.jacketDark || '#32195f',
      jacketLight: colors.jacketLight || '#aa86f0',
      shirt: colors.shirt || '#fff0d0',
      collar: colors.collar || '#fff4dd',
      pants: colors.pants || pants[index % pants.length],
      pantsDark: colors.pantsDark || '#080a10',
      shoe: colors.shoe || '#0d0b0b',
      belt: colors.belt || '#1c130e',
      robe: colors.robe || '#20283a',
      robeDark: colors.robeDark || '#0e121d',
      robeLight: colors.robeLight || '#404a64',
      sash: colors.sash || '#b8913e',
      beard: colors.beard || '#eee7dc',
      beardDark: colors.beardDark || '#b7afa4',
      shadow: colors.shadow || 'rgba(0,0,0,0.24)',
      shine: colors.shine || 'rgba(255,255,255,0.28)'
    };
  }

  /**
   * Resolves visible acting state.
   *
   * @param {Object} data - Character data.
   * @returns {string} Acting key.
   */
  static acting(data) {
    const raw = data.acting || data.gesture || data.motion || 'idle';
    const aliases = {
      easyMotion: 'walk',
      isWalking: 'walk',
      running: 'run',
      walking: 'walk',
      talking: 'explain',
      catch: 'catch',
      throwing: 'throw'
    };

    return aliases[raw] || raw;
  }

  /**
   * Resolves mouth openness.
   *
   * @param {Object} data - Character data.
   * @returns {number} Mouth openness from 0 to 1.
   */
  static mouth(data) {
    const values = [
      data.mouthOpen,
      data.talk,
      data.speech?.intensity,
      data.isTalking ? 0.52 : 0
    ];

    const n = values.find(Number.isFinite);
    return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
  }

  /**
   * Creates subtle eye dart.
   *
   * @param {Object} data - Character data.
   * @param {number} index - Character index.
   * @returns {Object} Eye offset.
   */
  static eyeDart(data, index) {
    const t = Number.isFinite(data._renderTime) ? data._renderTime : Date.now();
    return {
      x: Math.sin(t * 0.0007 + index) * 1.2,
      y: Math.cos(t * 0.0005 + index * 2) * 0.7
    };
  }

  /**
   * Resolves readable emotion.
   *
   * @param {Object} data - Character data.
   * @returns {string} Emotion key.
   */
  static emotion(data) {
    const key = data.emotion || data.acting || 'neutral';
    const aliases = {
      explain: 'happy',
      wave: 'happy',
      point: 'focused',
      thinker: 'focused',
      think: 'focused',
      throw: 'excited',
      catch: 'surprised',
      run: 'focused',
      walk: 'neutral',
      shrug: 'confused',
      breakdown: 'sad',
      facepalm: 'sad'
    };

    return aliases[key] || key;
  }
}