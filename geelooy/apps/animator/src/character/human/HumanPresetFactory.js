
// B"H
import { HumanCharacterSchema } from './HumanCharacterSchema.js';

/**
 * @file HumanPresetFactory.js
 * @description
 * ============================================================================
 * CHAPTER: THE EASY GATE INTO LIVING PEOPLE
 * ============================================================================
 *
 * The user should be able to summon a speaker, walker, listener, dancer,
 * thrower, catcher, or teacher with one clean preset. Each preset is complete:
 * body, clothing, motion, performance, speech behavior, and NLE readiness.
 *
 * @module HumanPresetFactory
 */

/**
 * @class HumanPresetFactory
 * @description
 * Creates complete human presets.
 */
export class HumanPresetFactory {
  /**
   * Creates a character from a named preset.
   *
   * @param {string} preset - Preset name.
   * @param {Object} overrides - Override data.
   * @returns {Object} Complete human character.
   */
  static create(preset, overrides = {}) {
    const data = this.presets()[preset] || this.presets().speaker;
    return HumanCharacterSchema.create({
      ...data,
      ...overrides,
      currentPerformance: {
        ...data.currentPerformance,
        ...(overrides.currentPerformance || {})
      },
      position: {
        ...(data.position || {}),
        ...(overrides.position || {})
      }
    });
  }

  /**
   * Returns all built-in presets.
   *
   * @returns {Object} Preset map.
   */
  static presets() {
    return {
      speaker: {
        name: 'Speaker',
        bodyProfile: 'broadSpeaker',
        motionProfile: 'energetic',
        clothingProfile: 'chossidBlackCoat',
        faceProfile: 'warmSpeaker',
        position: { x: -90, y: 0 },
        currentPerformance: {
          locomotion: 'idle',
          gesture: 'explain',
          speech: 'talk',
          emotion: 'happy',
          gaze: 'toward_camera'
        },
        dialogue: 'B"H, the world is alive with meaning.',
        speaking: true
      },
      walker: {
        name: 'Walker',
        bodyProfile: 'averageAdult',
        motionProfile: 'calm',
        clothingProfile: 'purpleJacket',
        faceProfile: 'focusedWalker',
        position: { x: 70, y: 0 },
        currentPerformance: {
          locomotion: 'walk',
          gesture: 'none',
          speech: 'none',
          emotion: 'calm',
          gaze: 'forward'
        }
      },
      waveTalker: {
        name: 'Wave Talker',
        bodyProfile: 'averageAdult',
        motionProfile: 'energetic',
        clothingProfile: 'purpleJacket',
        faceProfile: 'brightSpeaker',
        position: { x: 0, y: 0 },
        currentPerformance: {
          locomotion: 'walk',
          gesture: 'wave',
          speech: 'talk',
          emotion: 'happy',
          gaze: 'toward_camera'
        },
        dialogue: 'B"H, I can walk, talk, and wave at once.',
        speaking: true
      },
      dancer: {
        name: 'Dancer',
        bodyProfile: 'gentleWalker',
        motionProfile: 'joyfulDance',
        clothingProfile: 'chossidBlackCoat',
        faceProfile: 'ecstatic',
        position: { x: 100, y: 0 },
        currentPerformance: {
          locomotion: 'dance',
          gesture: 'wave',
          speech: 'none',
          emotion: 'happy',
          gaze: 'up'
        }
      }
    };
  }
}
