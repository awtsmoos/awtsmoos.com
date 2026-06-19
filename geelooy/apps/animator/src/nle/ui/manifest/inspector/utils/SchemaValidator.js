
// B"H
/**
 * @file SchemaValidator.js
 * @description
 * THE ANGEL OF TRUTH (Malach HaEmet).
 * B"H
 * 
 * The JSON editor is the raw fabric of reality. It must protect the user from 
 * shattering the universe with a typo. This class acts as a mini-IDE, analyzing 
 * the parsed JSON object against the strict laws of the Awtsmoos.
 */
export class SchemaValidator {
  /**
   * @function validate
   * @description Checks the event object for forbidden attributes.
   * @param {Object} event - The parsed JSON spark.
   * @returns {Array<string>} An array of prophetic warnings.
   */
  static validate(event) {
    const warnings = [];

    // Core Type Validation
    const validTypes = ['character', 'speech', 'camera', 'prop', 'scene_change'];
    if (!validTypes.includes(event.type)) {
      warnings.push(`INVALID TYPE: '${event.type}'. The Awtsmoos recognizes only: [${validTypes.join(', ')}].`);
    }

    // Time Causality Check
    if (typeof event.start !== 'number' || typeof event.end !== 'number') {
      warnings.push(`TIME FRACTURE: 'start' and 'end' must be numeric milliseconds.`);
    } else if (event.start >= event.end) {
      warnings.push(`PARADOX: 'start' time (${event.start}) cannot exceed 'end' time (${event.end}).`);
    }

    // Action Constraints
    if (event.actions && Array.isArray(event.actions)) {
      event.actions.forEach((a, idx) => {
        if (!a.key) warnings.push(`VOID ACTION at index ${idx}: Missing 'key'.`);
        if (a.key === 'emotion') {
          const validEmotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'smirk', 'hate'];
          if (!validEmotions.includes(a.value)) {
            warnings.push(`INVALID EMOTION: '${a.value}'. Expected: [${validEmotions.join(', ')}].`);
          }
        }
      });
    }

    return warnings;
  }
}
