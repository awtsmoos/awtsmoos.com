
// B"H

/**
 * @file HumanCharacterSchema.js
 * @description
 * ============================================================================
 * CHAPTER: THE HUMAN DATA COVENANT
 * ============================================================================
 *
 * The editor should not force the user to wrestle with elbows, knees, and
 * offsets. A human is declared as data: body, clothing, face, motion, action,
 * gesture, emotion, gaze, and speech. The engine interprets the structure.
 *
 * @module HumanCharacterSchema
 */

/**
 * @class HumanCharacterSchema
 * @description
 * Creates complete human character data objects.
 */
export class HumanCharacterSchema {
  /**
   * Creates a complete human character.
   *
   * @param {Object} data - User-provided character data.
   * @returns {Object} Complete normalized human character.
   */
  static create(data = {}) {
    const id = data.id || 'human_' + Date.now() + '_' + Math.floor(Math.random() * 9999);

    return {
      id,
      species: 'human',
      style: data.style || 'cartoon_realistic',
      name: data.name || id,
      bodyProfile: data.bodyProfile || 'averageAdult',
      motionProfile: data.motionProfile || 'calm',
      clothingProfile: data.clothingProfile || 'chossidBlackCoat',
      faceProfile: data.faceProfile || 'warmSpeaker',
      position: {
        x: Number(data.position?.x) || 0,
        y: Number(data.position?.y) || 0
      },
      scale: Number(data.scale) || 1,
      facing: data.facing || 'right',
      currentPerformance: {
        locomotion: data.currentPerformance?.locomotion || data.action || 'idle',
        gesture: data.currentPerformance?.gesture || data.gesture || 'none',
        speech: data.currentPerformance?.speech || data.speech || 'none',
        emotion: data.currentPerformance?.emotion || data.emotion || 'calm',
        gaze: data.currentPerformance?.gaze || data.gaze || 'toward_camera'
      },
      dialogue: data.dialogue || '',
      speaking: Boolean(data.speaking),
      selectable: data.selectable !== false,
      nle: {
        trackGroup: data.nle?.trackGroup || id,
        color: data.nle?.color || '#00f0ff'
      }
    };
  }

  /**
   * Normalizes existing character data without losing custom fields.
   *
   * @param {Object} character - Existing character.
   * @returns {Object} Complete character.
   */
  static normalize(character = {}) {
    return {
      ...character,
      ...this.create(character),
      id: character.id || this.create(character).id
    };
  }
}
