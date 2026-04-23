
/* B”H */

/**
 * @class EventSanitizer
 * @description
 * THE PURIFIER OF SPARKS (Taharat HaNitzotzot).
 * The Awtsmoos creates with absolute precision. Nothing is left undefined in the 
 * Divine Blueprint. This class acts as the Mohel (purifier), taking raw JSON events 
 * and guaranteeing they possess the necessary metaphysical structure (start, end, id, type) 
 * so they do not shatter the vessels of the NLE UI.
 */
export class EventSanitizer {
  /**
   * Cleanses a raw event object.
   * @param {Object} event - The raw, potentially chaotic event.
   * @returns {Object} The rectified, pure event.
   */
  static sanitize(event) {
    if (!event || typeof event !== 'object') {
      return { type: 'void', start: 0, end: 0, id: 'null_spark' };
    }

    const sanitized = { ...event };
    
    // Assign boundaries if missing
    sanitized.start = typeof sanitized.start === 'number' ? sanitized.start : 0;
    sanitized.end = typeof sanitized.end === 'number' ? Math.max(sanitized.start + 1000, sanitized.end) : sanitized.start + 1000;
    
    // Assign identity if missing
    if (!sanitized.id && sanitized.type !== 'camera' && sanitized.type !== 'scene') {
      sanitized.id = `spark_${Math.floor(Math.random() * 100000)}`;
    }

    // Ensure type exists
    sanitized.type = sanitized.type || 'unknown';

    return sanitized;
  }
}
